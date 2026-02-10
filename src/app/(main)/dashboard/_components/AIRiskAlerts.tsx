'use client';

import { GlassCard } from '@/components/ui';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';

interface RiskAlert {
  id: string;
  opportunityName: string;
  riskType: string;
  suggestion: string;
  opportunityId: string;
}

export function AIRiskAlerts() {
  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  // 从真实商机数据中提取风险预警
  const alerts: RiskAlert[] = opportunities
    .filter((o) => o.aiRisk || o.winRate < 0.3)
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      opportunityName: o.name,
      riskType: o.aiRisk ? '风险提示' : '赢率偏低',
      suggestion: o.aiRisk || `当前赢率仅 ${Math.round(o.winRate * 100)}%，建议重新评估并加强跟进。`,
      opportunityId: o.id,
    }));
  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          AI 风险预警
        </h3>
        <span className="text-xs text-slate-400">{alerts.length} 条预警</span>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">暂无风险预警</p>
        )}
        {alerts.map((alert) => (
          <Link
            key={alert.id}
            href={`/opportunities/${alert.opportunityId}`}
            className="block p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {alert.opportunityName}
                </p>
                <p className="text-xs text-danger mt-0.5">{alert.riskType}</p>
                <p className="text-xs text-slate-500 mt-1">{alert.suggestion}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 ml-2 mt-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
