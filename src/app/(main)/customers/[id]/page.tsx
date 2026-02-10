'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TabNavigation, Badge, GlassCard } from '@/components/ui';
import { StakeholderDirectory } from './_components/StakeholderDirectory';
import { AICustomerProfile } from './_components/AICustomerProfile';
import { useDataItem, useDataList } from '@/hooks/useData';
import type { Customer, Stakeholder } from '@/types/customer';
import type { Opportunity, CommunicationRecord } from '@/types/opportunity';
import { CUSTOMER_TIERS, CUSTOMER_CATEGORIES, MINE_TYPES } from '@/lib/constants';
import { ArrowLeft, Sparkles, Pencil } from 'lucide-react';

const tierMap = Object.fromEntries(CUSTOMER_TIERS.map((t) => [t.key, t]));
const mineMap = Object.fromEntries(MINE_TYPES.map((m) => [m.key, m.label]));

const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'stakeholders', label: '干系人通讯录' },
  { key: 'opportunities', label: '关联商机' },
  { key: 'communications', label: '沟通记录' },
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');

  const id = params.id as string;
  const { data: customer } = useDataItem<Customer>(`/api/customers/${id}`);
  const { data: stakeholders } = useDataList<Stakeholder>(`/api/customers/${id}/stakeholders`);
  const { data: opps } = useDataList<Opportunity>(`/api/opportunities?customerId=${id}`);
  const { data: records } = useDataList<CommunicationRecord>(`/api/communications?entityId=${id}`);

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const tier = tierMap[customer.tier];

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
            <Badge variant={tier?.color as 'red' | 'orange' | 'blue'}>
              {tier?.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {mineMap[customer.mineType]} · {customer.region}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-1" />
          生成营销方案
        </Button>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

          {activeTab === 'basic' && <BasicInfo customer={customer} />}
          {activeTab === 'stakeholders' && <StakeholderDirectory stakeholders={stakeholders} />}
          {activeTab === 'opportunities' && <OpportunitiesList opps={opps} />}
          {activeTab === 'communications' && <CommsList records={records} />}
        </div>
        <div className="w-72 shrink-0">
          <AICustomerProfile customer={customer} />
        </div>
      </div>
    </div>
  );
}

const mineOptions = [
  { value: '', label: '请选择矿种' },
  ...MINE_TYPES.map((m) => ({ value: m.key, label: m.label })),
];
const tierOptions = [
  { value: '', label: '请选择客户层级' },
  ...CUSTOMER_TIERS.map((t) => ({ value: t.key, label: t.label })),
];
const categoryOptions = [
  { value: '', label: '请选择客户类别' },
  ...CUSTOMER_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];

function BasicInfo({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: customer.name,
    mineType: customer.mineType,
    group: customer.group || '',
    region: customer.region,
    tier: customer.tier,
    category: customer.category,
    annualCapacity: customer.annualCapacity || '',
    contactPhone: customer.contactPhone || '',
    contactEmail: customer.contactEmail || '',
  });

  const handleSave = () => {
    // Mock save - in real app would call API
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: customer.name,
      mineType: customer.mineType,
      group: customer.group || '',
      region: customer.region,
      tier: customer.tier,
      category: customer.category,
      annualCapacity: customer.annualCapacity || '',
      contactPhone: customer.contactPhone || '',
      contactEmail: customer.contactEmail || '',
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
          <Input label="客户名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="矿种" options={mineOptions} value={form.mineType} onChange={(e) => setForm({ ...form, mineType: e.target.value as typeof form.mineType })} />
            <Select label="客户层级" options={tierOptions} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as typeof form.tier })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="客户类别" options={categoryOptions} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })} />
            <Input label="所属集团" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="地区" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            <Input label="年产能" value={form.annualCapacity} onChange={(e) => setForm({ ...form, annualCapacity: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="联系电话" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            <Input label="联系邮箱" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
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
        ['客户名称', customer.name],
        ['矿种', MINE_TYPES.find((m) => m.key === customer.mineType)?.label],
        ['所属集团', customer.group || '-'],
        ['地区', customer.region],
        ['客户层级', tierMap[customer.tier]?.label || '-'],
        ['客户类别', CUSTOMER_CATEGORIES.find((c) => c.key === customer.category)?.label || '-'],
        ['年产能', customer.annualCapacity || '-'],
        ['联系电话', customer.contactPhone || '-'],
        ['合作伙伴', customer.partnerName || '-'],
        ['创建时间', customer.createdAt],
      ].map(([label, value]) => (
        <div key={label} className="flex py-2.5 border-b border-slate-100 last:border-0">
          <span className="w-28 text-sm text-slate-500 shrink-0">{label}</span>
          <span className="text-sm text-slate-800">{value}</span>
        </div>
      ))}
    </GlassCard>
  );
}

function OpportunitiesList({ opps }: { opps: Opportunity[] }) {
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
                <p className="text-xs text-slate-400 mt-0.5">{o.updatedAt}</p>
              </div>
              <span className="text-sm font-medium text-primary">
                {Math.round(o.winRate * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function CommsList({ records }: { records: CommunicationRecord[] }) {
  return (
    <GlassCard>
      {records.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">暂无沟通记录</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-700">{r.content}</p>
              <p className="text-xs text-slate-400 mt-1">
                {r.createdAt} · {r.createdBy}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
