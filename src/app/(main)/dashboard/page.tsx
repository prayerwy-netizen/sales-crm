'use client';

import { StatCard } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { AIRiskAlerts } from './_components/AIRiskAlerts';
import { TodoList } from './_components/TodoList';
import { ActivityTimeline } from './_components/ActivityTimeline';
import { STAGES } from '@/lib/constants';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';
import { Briefcase, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: allOpportunities } = useDataList<Opportunity>('/api/opportunities');
  const activeOpps = allOpportunities.filter((o) => o.status === 'active');
  const riskOpps = activeOpps.filter((o) => o.aiRisk);
  const totalAmount = activeOpps.reduce((sum, o) => sum + o.expectedAmount, 0);
  const newThisMonth = activeOpps.filter(
    (o) => new Date(o.createdAt) >= new Date('2026-02-01')
  ).length;

  const funnelData = STAGES.map((stage) => {
    const stageOpps = activeOpps.filter((o) => o.stage === stage.key);
    return {
      stage: stage.key,
      label: stage.label,
      count: stageOpps.length,
      amount: stageOpps.reduce((s, o) => s + o.expectedAmount, 0),
      color: stage.color,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">工作台</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="本月商机总数"
          value={activeOpps.length}
          change={12}
          icon={Briefcase}
          iconColor="text-primary"
        />
        <StatCard
          title="本月新增商机"
          value={newThisMonth}
          change={25}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="预计签单金额"
          value={formatCurrency(totalAmount)}
          change={8}
          icon={DollarSign}
          iconColor="text-warning"
        />
        <StatCard
          title="风险商机数"
          value={riskOpps.length}
          change={-15}
          icon={AlertTriangle}
          iconColor="text-danger"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <GlassCard>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              销售漏斗
            </h3>
            <FunnelChart data={funnelData} />
          </GlassCard>
        </div>
        <div className="col-span-2">
          <AIRiskAlerts />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        <TodoList />
        <ActivityTimeline />
      </div>
    </div>
  );
}
