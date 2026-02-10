'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { useDataList } from '@/hooks/useData';
import type { Customer } from '@/types/customer';
import type { Opportunity } from '@/types/opportunity';
import { CUSTOMER_TIERS, MINE_TYPES, CUSTOMER_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const tabs = [
  { key: 'distribution', label: '客户分布' },
  { key: 'activity', label: '活跃度分析' },
  { key: 'value', label: '价值分析' },
];

export default function CustomerStatsPage() {
  const [activeTab, setActiveTab] = useState('distribution');
  const { data: customers } = useDataList<Customer>('/api/customers');
  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  const totalCount = customers.length;
  const byTier = CUSTOMER_TIERS.map((t) => ({
    label: t.label,
    count: customers.filter((c) => c.tier === t.key).length,
    color: t.color,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">客户统计</h2>

      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">客户总数</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
        </GlassCard>
        {byTier.map((t) => (
          <GlassCard key={t.label} className="text-center">
            <p className="text-xs text-slate-500">{t.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{t.count}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
        {activeTab === 'distribution' && <DistributionView customers={customers} />}
        {activeTab === 'activity' && <ActivityView customers={customers} opportunities={opportunities} />}
        {activeTab === 'value' && <ValueView customers={customers} opportunities={opportunities} />}
      </GlassCard>
    </div>
  );
}

function DistributionView({ customers }: { customers: Customer[] }) {
  const byMine = MINE_TYPES.map((m) => ({
    label: m.label,
    count: customers.filter((c) => c.mineType === m.key).length,
  }));
  const byCategory = CUSTOMER_CATEGORIES.map((cat) => ({
    label: cat.label,
    count: customers.filter((c) => c.category === cat.key).length,
  }));

  // Group by region
  const regionMap: Record<string, number> = {};
  customers.forEach((c) => {
    regionMap[c.region] = (regionMap[c.region] || 0) + 1;
  });
  const byRegion = Object.entries(regionMap)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* By mine type */}
        <div>
          <h5 className="text-xs font-medium text-slate-500 mb-3">按矿种分布</h5>
          <div className="space-y-2">
            {byMine.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="text-sm font-medium text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        {/* By category */}
        <div>
          <h5 className="text-xs font-medium text-slate-500 mb-3">按客户类别</h5>
          <div className="space-y-2">
            {byCategory.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="text-sm font-medium text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* By region */}
      <div>
        <h5 className="text-xs font-medium text-slate-500 mb-3">按地区分布</h5>
        <div className="grid grid-cols-3 gap-2">
          {byRegion.map((item) => (
            <div key={item.region} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm text-slate-700">{item.region}</span>
              <span className="text-sm font-medium text-slate-800">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityView({ customers, opportunities }: { customers: Customer[]; opportunities: Opportunity[] }) {
  const customersWithOpp = customers.map((c) => {
    const oppCount = opportunities.filter((o) => o.customerId === c.id).length;
    return { ...c, oppCount };
  });

  const active = customers.filter((c) => c.lastContactDate && c.lastContactDate >= '2026-01-01');
  const inactive = customers.filter((c) => !c.lastContactDate || c.lastContactDate < '2026-01-01');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <p className="text-xs text-green-600 font-medium">近期活跃客户</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{active.length}</p>
          <p className="text-xs text-green-500 mt-1">最近30天有联系</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
          <p className="text-xs text-orange-600 font-medium">待跟进客户</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{inactive.length}</p>
          <p className="text-xs text-orange-500 mt-1">超过30天未联系</p>
        </div>
      </div>
      <div>
        <h5 className="text-xs font-medium text-slate-500 mb-3">客户活跃度排名</h5>
        <div className="space-y-2">
          {customersWithOpp
            .sort((a, b) => b.oppCount - a.oppCount)
            .slice(0, 8)
            .map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <span className="w-5 text-xs text-slate-400 text-right">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-700">{c.name}</span>
                <span className="text-xs text-slate-400">{c.oppCount} 个商机</span>
                <span className="text-xs text-slate-400">{c.lastContactDate || '-'}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function ValueView({ customers, opportunities }: { customers: Customer[]; opportunities: Opportunity[] }) {
  const customersWithValue = customers.map((c) => {
    const opps = opportunities.filter((o) => o.customerId === c.id);
    const totalAmount = opps.reduce((s, o) => s + o.expectedAmount, 0);
    return { ...c, totalAmount, oppCount: opps.length };
  });

  const sorted = customersWithValue.sort((a, b) => b.totalAmount - a.totalAmount);
  const maxAmount = Math.max(...sorted.map((c) => c.totalAmount), 1);

  return (
    <div className="space-y-4">
      <h5 className="text-xs font-medium text-slate-500">客户价值排名（按商机金额）</h5>
      <div className="space-y-3">
        {sorted.slice(0, 10).map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="w-5 text-xs text-slate-400 text-right shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-800">
                  {c.name}
                </span>
                <span className="text-sm text-slate-600">
                  {formatCurrency(c.totalAmount)}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(c.totalAmount / maxAmount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-0.5">
                {c.oppCount} 个商机
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
