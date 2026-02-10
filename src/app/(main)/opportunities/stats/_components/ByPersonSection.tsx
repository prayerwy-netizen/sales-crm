'use client';

import type { Opportunity } from '@/types/opportunity';
import { formatCurrency } from '@/lib/utils';

export function ByPersonSection({ opportunities }: { opportunities: Opportunity[] }) {
  // Group by owner
  const byPerson = opportunities.reduce<
    Record<string, { name: string; count: number; amount: number; wonCount: number }>
  >((acc, o) => {
    if (!acc[o.ownerId]) {
      acc[o.ownerId] = { name: o.ownerName, count: 0, amount: 0, wonCount: 0 };
    }
    acc[o.ownerId].count++;
    acc[o.ownerId].amount += o.expectedAmount;
    if (o.status === 'won') acc[o.ownerId].wonCount++;
    return acc;
  }, {});

  const people = Object.values(byPerson).sort((a, b) => b.amount - a.amount);
  const maxAmount = Math.max(...people.map((p) => p.amount), 1);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">按销售人员统计</h4>

      <div className="space-y-3">
        {people.map((person) => (
          <div key={person.name} className="flex items-center gap-4">
            <div className="w-16 shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {person.name.slice(0, 1)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-800">{person.name}</span>
                <span className="text-sm text-slate-600">{formatCurrency(person.amount)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(person.amount / maxAmount) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-slate-400">{person.count} 个商机</span>
                <span className="text-xs text-slate-400">{person.wonCount} 个赢单</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
