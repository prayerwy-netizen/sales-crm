import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = '暂无数据',
  description = '当前没有可显示的内容',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <Inbox className="h-12 w-12 text-slate-300 mb-4" />
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
