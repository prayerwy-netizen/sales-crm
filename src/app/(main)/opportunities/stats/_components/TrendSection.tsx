'use client';

import type { Opportunity } from '@/types/opportunity';
import { formatCurrency } from '@/lib/utils';

export function TrendSection({ opportunities }: { opportunities: Opportunity[] }) {
  // Group by month (from createdAt)
  const byMonth = opportunities.reduce<
    Record<string, { month: string; count: number; amount: number }>
  >((acc, o) => {
    const month = o.createdAt.slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, count: 0, amount: 0 };
    }
    acc[month].count++;
    acc[month].amount += o.expectedAmount;
    return acc;
  }, {});

  const months = Object.values(byMonth).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
  const maxAmount = Math.max(...months.map((m) => m.amount), 1);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">
        商机趋势（按月）
      </h4>

      {/* Bar chart */}
      <div className="flex items-end gap-3 h-48 px-4">
        {months.map((item) => {
          const heightPct = (item.amount / maxAmount) * 100;
          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-slate-500">
                {item.count}个
              </span>
              <div
                className="w-full bg-primary/20 rounded-t-lg relative group cursor-pointer transition-all hover:bg-primary/30"
                style={{ height: `${Math.max(heightPct, 5)}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all"
                  style={{ height: '60%' }}
                />
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {formatCurrency(item.amount)}
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {item.month.slice(5)}月
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="border-t border-slate-100 pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left font-medium py-1">月份</th>
              <th className="text-right font-medium py-1">商机数</th>
              <th className="text-right font-medium py-1">金额</th>
            </tr>
          </thead>
          <tbody>
            {months.map((item) => (
              <tr
                key={item.month}
                className="border-t border-slate-50"
              >
                <td className="py-1.5 text-slate-700">
                  {item.month}
                </td>
                <td className="py-1.5 text-right text-slate-700">
                  {item.count}
                </td>
                <td className="py-1.5 text-right text-slate-700">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
