'use client';

import { cn } from '@/lib/utils';

interface SelfAssessmentOption {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  label: string;
}

interface SelfAssessmentProps {
  options: SelfAssessmentOption[];
  value: string;
  onChange: (grade: string) => void;
}

const gradeColors: Record<string, string> = {
  A: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  B: 'border-blue-400 bg-blue-50 text-blue-700',
  C: 'border-amber-400 bg-amber-50 text-amber-700',
  D: 'border-orange-400 bg-orange-50 text-orange-700',
  E: 'border-slate-400 bg-slate-50 text-slate-500',
};

const gradeSelectedColors: Record<string, string> = {
  A: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300',
  B: 'border-blue-500 bg-blue-100 ring-2 ring-blue-300',
  C: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300',
  D: 'border-orange-500 bg-orange-100 ring-2 ring-orange-300',
  E: 'border-slate-500 bg-slate-100 ring-2 ring-slate-300',
};

export function SelfAssessment({ options, value, onChange }: SelfAssessmentProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        自评得分
      </label>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const selected = value === opt.grade;
          return (
            <button
              key={opt.grade}
              type="button"
              onClick={() => onChange(opt.grade)}
              className={cn(
                'w-full flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 cursor-pointer',
                selected ? gradeSelectedColors[opt.grade] : gradeColors[opt.grade],
                !selected && 'opacity-70 hover:opacity-100'
              )}
            >
              <span className="shrink-0 font-bold text-xs mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-white/60">
                {opt.grade}
              </span>
              <span className="leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
