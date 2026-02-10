'use client';

import { STAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { StageKey } from '@/lib/constants';

interface StageProgressBarProps {
  currentStage: StageKey;
}

export function StageProgressBar({ currentStage }: StageProgressBarProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, index) => (
        <div key={stage.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                'h-2 w-full rounded-full transition-colors',
                index <= currentIndex ? 'bg-primary' : 'bg-slate-200'
              )}
            />
            <span
              className={cn(
                'text-[10px] mt-1',
                index <= currentIndex ? 'text-primary font-medium' : 'text-slate-400'
              )}
            >
              {stage.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
