'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Building2, User, Loader2, Link2 } from 'lucide-react';
import { Badge, GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import type { BaseCustomer, BaseContact } from '@/types/customer';

const gradeColors: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  A: 'red',
  B: 'orange',
  C: 'blue',
  D: 'gray',
};

export default function BaseCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<BaseCustomer | null>(null);
  const [contacts, setContacts] = useState<BaseContact[]>([]);
  const [asDealer, setAsDealer] = useState<any[]>([]);
  const [asCustomer, setAsCustomer] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/base-customers/${id}`);
        const json = await res.json();
        setCustomer(json.customer || null);
        setContacts(json.contacts || []);
        setAsDealer(json.asDealer || []);
        setAsCustomer(json.asCustomer || []);
      } catch {
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-slate-400">加载中...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">客户不存在</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{customer.name}</h2>
            {customer.customerGrade && (
              <Badge variant={gradeColors[customer.customerGrade] || 'gray'}>
                {customer.customerGrade}级
              </Badge>
            )}
            {customer.customerType && (
              <Badge variant="blue">{customer.customerType}</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {customer.province} {customer.city} {customer.county || ''}
            {customer.businessType ? ` · ${customer.businessType}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: Basic Info */}
        <div className="col-span-2 space-y-4">
          <CustomerInfo customer={customer} />
          <RelationsList asDealer={asDealer} asCustomer={asCustomer} />
          <ContactsList contacts={contacts} />
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <QuickInfo customer={customer} />
        </div>
      </div>
    </div>
  );
}

function CustomerInfo({ customer }: { customer: BaseCustomer }) {
  const fields: [string, string | undefined][] = [
    ['客户名称', customer.name],
    ['法定代表人', customer.legalRepresentative],
    ['统一社会信用代码', customer.socialCreditCode],
    ['省份', customer.province],
    ['城市', customer.city],
    ['区县', customer.county],
    ['详细地址', customer.detailAddress],
    ['行业类型', customer.businessType],
    ['客户类型', customer.customerType],
    ['二级分类', customer.secondType],
    ['客户等级', customer.customerGrade],
    ['信用评分', customer.creditScore?.toString()],
    ['实际控制人', customer.actualController],
  ];

  return (
    <GlassCard>
      <h4 className="text-sm font-semibold text-slate-800 mb-3">基本信息</h4>
      <div className="grid grid-cols-2 gap-x-6">
        {fields.map(([label, value]) => (
          <div key={label} className="flex py-2.5 border-b border-slate-100 last:border-0">
            <span className="w-32 text-sm text-slate-500 shrink-0">{label}</span>
            <span className="text-sm text-slate-800">{value || '-'}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ContactsList({ contacts }: { contacts: BaseContact[] }) {
  return (
    <GlassCard>
      <h4 className="text-sm font-semibold text-slate-800 mb-3">
        联系人 ({contacts.length})
      </h4>
      {contacts.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">暂无联系人信息</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.name}
                    {c.gender === 'male' ? ' (男)' : c.gender === 'female' ? ' (女)' : ''}
                  </p>
                  <p className="text-xs text-slate-400">{c.position || '未知职位'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {c.phone1 && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {c.phone1}
                  </span>
                )}
                {c.phone2 && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {c.phone2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function RelationsList({ asDealer, asCustomer }: { asDealer: any[]; asCustomer: any[] }) {
  const router = useRouter();
  const hasDealer = asDealer.length > 0;
  const hasCustomer = asCustomer.length > 0;

  if (!hasDealer && !hasCustomer) return null;

  return (
    <GlassCard>
      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        渠道关联关系
      </h4>

      {hasDealer && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">作为经销商/总集成商，关联的终端客户：</p>
          <div className="space-y-1.5">
            {asDealer.map((r: any) => (
              <div
                key={r.id}
                onClick={() => router.push(`/customers/base/${r.customer?.id || r.customerId}`)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {r.customer?.name || '未知客户'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.customer?.province || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{r.sharedContactName || ''}</p>
                  <p className="text-xs text-slate-400">{r.sharedContactPhone || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasCustomer && (
        <div>
          <p className="text-xs text-slate-400 mb-2">关联的经销商/总集成商：</p>
          <div className="space-y-1.5">
            {asCustomer.map((r: any) => (
              <div
                key={r.id}
                onClick={() => router.push(`/customers/base/${r.dealer?.id || r.dealerId}`)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/30 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {r.dealer?.name || '未知渠道'}
                  </p>
                  <Badge variant="purple" className="mt-0.5">
                    {r.dealer?.customerType || '渠道商'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{r.sharedContactName || ''}</p>
                  <p className="text-xs text-slate-400">{r.sharedContactPhone || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function QuickInfo({ customer }: { customer: BaseCustomer }) {
  return (
    <GlassCard>
      <h4 className="text-sm font-semibold text-slate-800 mb-3">快速概览</h4>
      <div className="space-y-3">
        {customer.province && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-600">
              {customer.province} {customer.city} {customer.county || ''}
            </span>
          </div>
        )}
        {customer.businessType && (
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-600">{customer.businessType}</span>
          </div>
        )}
        {customer.actualController && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">实际控制人</p>
              <p className="text-sm text-slate-600">{customer.actualController}</p>
            </div>
          </div>
        )}
        {customer.creditScore != null && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-400 mb-1">信用评分</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-800">{customer.creditScore}</span>
              <span className="text-xs text-slate-400 mb-1">/ 100</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(customer.creditScore, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
