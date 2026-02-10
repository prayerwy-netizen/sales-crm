'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TabNavigation, Badge, GlassCard } from '@/components/ui';
import { AIHealthAssessment } from './_components/AIHealthAssessment';
import { CapabilityRadar } from './_components/CapabilityRadar';
import { useDataItem, useDataList } from '@/hooks/useData';
import type { Partner } from '@/types/partner';
import type { Customer } from '@/types/customer';
import type { Opportunity } from '@/types/opportunity';
import { PARTNER_STATUSES, SALES_PATHS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Pencil } from 'lucide-react';

const statusMap = Object.fromEntries(PARTNER_STATUSES.map((s) => [s.key, s]));

const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'customers', label: '关联客户' },
  { key: 'opportunities', label: '关联商机' },
  { key: 'performance', label: '业绩统计' },
];

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');

  const id = params.id as string;
  const { data: partner } = useDataItem<Partner>(`/api/partners/${id}`);
  const { data: allCustomers } = useDataList<Customer>('/api/customers');
  const { data: allOpportunities } = useDataList<Opportunity>('/api/opportunities');

  if (!partner) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const status = statusMap[partner.status];
  const relatedCustomers = allCustomers.filter((c) => c.partnerId === id);
  const relatedOpps = allOpportunities.filter((o) => o.partnerId === id);

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
            <h2 className="text-lg font-bold text-slate-800">{partner.name}</h2>
            <Badge variant={status?.color as 'green' | 'yellow' | 'gray'}>
              {status?.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {partner.region} · {partner.cooperationMode === 'direct_commission' ? '直签佣金制' : '转售折扣制'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

          {activeTab === 'basic' && <BasicInfo partner={partner} />}
          {activeTab === 'customers' && <CustomersList customers={relatedCustomers} />}
          {activeTab === 'opportunities' && <OppsList opps={relatedOpps} />}
          {activeTab === 'performance' && <PerformanceStats partner={partner} />}
        </div>
        <div className="w-72 shrink-0 space-y-4">
          <AIHealthAssessment partner={partner} />
          <CapabilityRadar partner={partner} />
        </div>
      </div>
    </div>
  );
}

const modeOptions = [
  { value: '', label: '请选择合作模式' },
  ...SALES_PATHS.map((s) => ({ value: s.key, label: s.label })),
];
const partnerStatusOptions = [
  { value: '', label: '请选择状态' },
  ...PARTNER_STATUSES.map((s) => ({ value: s.key, label: s.label })),
];

function BasicInfo({ partner }: { partner: Partner }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: partner.name,
    region: partner.region,
    cooperationMode: partner.cooperationMode,
    status: partner.status,
    startDate: partner.startDate,
    contactName: partner.contactName || '',
    contactPhone: partner.contactPhone || '',
    contactEmail: partner.contactEmail || '',
    profitShareRatio: String(partner.profitShareRatio * 100),
  });

  const handleSave = () => {
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: partner.name,
      region: partner.region,
      cooperationMode: partner.cooperationMode,
      status: partner.status,
      startDate: partner.startDate,
      contactName: partner.contactName || '',
      contactPhone: partner.contactPhone || '',
      contactEmail: partner.contactEmail || '',
      profitShareRatio: String(partner.profitShareRatio * 100),
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-800">编辑基本信息</h4>
        </div>
        <div className="space-y-3">
          <Input label="伙伴名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="覆盖区域" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            <Select label="合作模式" options={modeOptions} value={form.cooperationMode} onChange={(e) => setForm({ ...form, cooperationMode: e.target.value as typeof form.cooperationMode })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="合作状态" options={partnerStatusOptions} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} />
            <Input label="合作起始日期" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="联系人" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            <Input label="联系电话" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="联系邮箱" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            <Input label="利润分配比例(%)" type="number" value={form.profitShareRatio} onChange={(e) => setForm({ ...form, profitShareRatio: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleCancel}>取消</Button>
            <Button size="sm" onClick={handleSave}>保存</Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-800">基本信息</h4>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          编辑
        </Button>
      </div>
      {[
        ['伙伴名称', partner.name],
        ['覆盖区域', partner.region],
        ['合作模式', partner.cooperationMode === 'direct_commission' ? '直签佣金制' : '转售折扣制'],
        ['合作起始日期', partner.startDate],
        ['联系人', partner.contactName || '-'],
        ['联系电话', partner.contactPhone || '-'],
        ['利润分配比例', `${partner.profitShareRatio * 100}%`],
        ['技术交付能力', `${partner.techCapability}/10`],
        ['客户资源覆盖', `${partner.customerCoverage}/10`],
        ['历史合作评价', `${partner.historicalRating}/10`],
      ].map(([label, value]) => (
        <div key={label} className="flex py-2.5 border-b border-slate-100 last:border-0">
          <span className="w-32 text-sm text-slate-500 shrink-0">{label}</span>
          <span className="text-sm text-slate-800">{value}</span>
        </div>
      ))}
    </GlassCard>
  );
}

function CustomersList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  return (
    <GlassCard>
      {customers.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">暂无关联客户</p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/customers/${c.id}`)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.region} · {c.mineType === 'coal' ? '煤矿' : c.mineType === 'metal' ? '金属矿' : '非金属矿'}</p>
              </div>
              <span className="text-xs text-slate-400">{c.opportunityCount} 个商机</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function OppsList({ opps }: { opps: Opportunity[] }) {
  const router = useRouter();
  return (
    <GlassCard>
      {opps.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">暂无关联商机</p>
      ) : (
        <div className="space-y-2">
          {opps.map((o) => (
            <div
              key={o.id}
              onClick={() => router.push(`/opportunities/${o.id}`)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{o.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{o.customerName}</p>
              </div>
              <span className="text-sm font-medium text-primary">
                {formatCurrency(o.expectedAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function PerformanceStats({ partner }: { partner: Partner }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">商机数量</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{partner.opportunityCount}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">商机金额</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(partner.totalAmount)}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">转化率</p>
          <p className="text-2xl font-bold text-primary mt-1">{Math.round(partner.conversionRate * 100)}%</p>
        </GlassCard>
      </div>
      <GlassCard>
        <p className="text-sm text-slate-500 text-center py-8">
          业绩趋势图表（接入真实数据后展示）
        </p>
      </GlassCard>
    </div>
  );
}
