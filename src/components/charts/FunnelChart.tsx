'use client';

import { STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface FunnelData {
  stage: string;
  label: string;
  count: number;
  amount: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const widthPercent = Math.max((item.count / maxCount) * 100, 20);
        return (
          <div key={item.stage} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
              <span className="text-xs text-slate-500">
                {item.count}个 · {formatCurrency(item.amount)}
              </span>
            </div>
            <div className="relative h-8 rounded-lg overflow-hidden bg-slate-100">
              <div
                className="h-full rounded-lg transition-all duration-500 group-hover:opacity-90 flex items-center justify-center"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: item.color,
                  marginLeft: `${(100 - widthPercent) / 2}%`,
                }}
              >
                <span className="text-xs font-medium text-white">
                  {item.count}
                </span>
              </div>
            </div>
            {index < data.length - 1 && (
              <div className="flex justify-center mt-1">
                <span className="text-[10px] text-slate-400">
                  转化率{' '}
                  {data[index + 1].count > 0
                    ? Math.round((data[index + 1].count / item.count) * 100)
                    : 0}
                  %
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
