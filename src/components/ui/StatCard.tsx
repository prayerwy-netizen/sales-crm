import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconColor === 'text-primary' ? 'bg-blue-50' : 'bg-slate-50')}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center text-xs">
          <span className={cn('font-medium', change >= 0 ? 'text-success' : 'text-danger')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="ml-1.5 text-slate-400">较上月</span>
        </div>
      )}
    </div>
  );
}
