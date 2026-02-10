'use client';

import type { Opportunity } from '@/types/opportunity';
import { STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export function FunnelSection({ opportunities }: { opportunities: Opportunity[] }) {
  const stageData = STAGES.map((stage) => {
    const opps = opportunities.filter((o) => o.stage === stage.key);
    return {
      label: stage.label,
      count: opps.length,
      amount: opps.reduce((s, o) => s + o.expectedAmount, 0),
      color: stage.color,
    };
  });

  const maxCount = Math.max(...stageData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold text-slate-800">销售漏斗</h4>

      {/* Funnel visualization */}
      <div className="space-y-2">
        {stageData.map((item, i) => {
          const widthPct = Math.max(20, ((maxCount - i * 0.8) / maxCount) * 100);
          return (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-20 text-xs text-slate-500 text-right shrink-0">
                {item.label}
              </span>
              <div className="flex-1 relative">
                <div
                  className="h-10 rounded-lg flex items-center px-3 transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: item.color + '20',
                    borderLeft: `4px solid ${item.color}`,
                  }}
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.count} 个
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage conversion rates */}
      <div className="border-t border-slate-100 pt-4">
        <h5 className="text-xs font-medium text-slate-500 mb-3">阶段转化率</h5>
        <div className="flex items-center gap-2">
          {stageData.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-lg font-bold text-slate-800">{item.count}</p>
              </div>
              {i < stageData.length - 1 && (
                <div className="text-xs text-slate-400 px-1">
                  →{' '}
                  {stageData[i + 1].count > 0 && item.count > 0
                    ? `${Math.round((stageData[i + 1].count / item.count) * 100)}%`
                    : '-'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
