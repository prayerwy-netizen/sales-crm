'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Clock, User } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: () => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const hasRisk = !!opportunity.aiRisk;
  const daysUntilClose = Math.ceil(
    (new Date(opportunity.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isDueSoon = daysUntilClose >= 0 && daysUntilClose <= 14 && !hasRisk;

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        hasRisk && 'border-danger/40 ring-1 ring-danger/20',
        isDueSoon && 'border-warning/40 ring-1 ring-warning/20'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-800 line-clamp-1 flex-1">
          {opportunity.name}
        </h4>
        <span className="text-xs font-semibold text-primary ml-2">
          {Math.round(opportunity.winRate * 100)}%
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-2">{opportunity.customerName}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          {formatCurrency(opportunity.expectedAmount)}
        </span>
        <Badge
          variant={
            opportunity.productLine === 'full_solution'
              ? 'blue'
              : opportunity.productLine === 'saas'
              ? 'green'
              : 'purple'
          }
        >
          {opportunity.productLine === 'full_solution'
            ? '全案'
            : opportunity.productLine === 'saas'
            ? 'SaaS'
            : 'MaaS'}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <User className="h-3 w-3" />
          {opportunity.ownerName}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          {opportunity.updatedAt}
        </div>
      </div>

      {hasRisk && (
        <div className="mt-2 p-1.5 rounded bg-red-50 text-xs text-danger line-clamp-1">
          {opportunity.aiRisk}
        </div>
      )}
    </div>
  );
}
