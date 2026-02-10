'use client';

import { cn } from '@/lib/utils';

interface ScoreItem {
  label: string;
  value: number | string | null;
  weight?: number;
  suffix?: string;
}

interface ScorePanelProps {
  items: ScoreItem[];
  total: number | string | null;
  totalLabel?: string;
}

export function ScorePanel({ items, total, totalLabel = '合计得分' }: ScorePanelProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="text-center min-w-[80px]">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-lg font-bold text-slate-700 mt-0.5">
              {item.value ?? '-'}
              {item.suffix && <span className="text-xs font-normal text-slate-400 ml-0.5">{item.suffix}</span>}
            </p>
            {item.weight != null && (
              <p className="text-[10px] text-slate-400">x{item.weight}</p>
            )}
          </div>
        ))}
        <div className="ml-auto text-center min-w-[90px] pl-4 border-l border-slate-200">
          <p className="text-xs text-slate-500">{totalLabel}</p>
          <p className={cn(
            'text-2xl font-bold mt-0.5',
            total === null || total === '-' ? 'text-slate-400' : 'text-primary'
          )}>
            {total ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
