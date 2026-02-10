'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';
import { STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { FunnelSection } from './_components/FunnelSection';
import { ByPersonSection } from './_components/ByPersonSection';
import { TrendSection } from './_components/TrendSection';

const tabs = [
  { key: 'funnel', label: '销售漏斗' },
  { key: 'person', label: '按人统计' },
  { key: 'trend', label: '趋势分析' },
];

export default function OpportunityStatsPage() {
  const [activeTab, setActiveTab] = useState('funnel');
  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  const totalAmount = opportunities.reduce((s, o) => s + o.expectedAmount, 0);
  const activeCount = opportunities.filter((o) => o.status === 'active').length;
  const wonCount = opportunities.filter((o) => o.status === 'won').length;
  const avgWinRate = opportunities.length > 0
    ? opportunities.reduce((s, o) => s + o.winRate, 0) / opportunities.length
    : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">商机统计</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">商机总数</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{opportunities.length}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">进行中</p>
          <p className="text-2xl font-bold text-primary mt-1">{activeCount}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">总金额</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalAmount)}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-slate-500">平均赢率</p>
          <p className="text-2xl font-bold text-success mt-1">{Math.round(avgWinRate * 100)}%</p>
        </GlassCard>
      </div>

      {/* Tab content */}
      <GlassCard>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
        {activeTab === 'funnel' && <FunnelSection opportunities={opportunities} />}
        {activeTab === 'person' && <ByPersonSection opportunities={opportunities} />}
        {activeTab === 'trend' && <TrendSection opportunities={opportunities} />}
      </GlassCard>
    </div>
  );
}
