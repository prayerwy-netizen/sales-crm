'use client';

import { useState, useCallback } from 'react';
import { GlassCard } from '@/components/ui';
import { DIMENSIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { StageKey } from '@/lib/constants';
import type { DimensionScore } from '@/types/opportunity';

interface EvaluationSummaryTabProps {
  currentStage: StageKey;
  scores: DimensionScore[];
  opportunityId?: string;
}

export function EvaluationSummaryTab({ currentStage, scores, opportunityId }: EvaluationSummaryTabProps) {
  const scoreMap = Object.fromEntries(scores.map((s) => [s.dimensionKey, s]));
  const [localReview, setLocalReview] = useState<Record<string, number>>({});

  const handleReviewChange = useCallback(async (dimKey: string, value: number) => {
    setLocalReview((prev) => ({ ...prev, [dimKey]: value }));
    if (!opportunityId) return;
    try {
      const existing = scoreMap[dimKey];
      await fetch(`/api/opportunities/${opportunityId}/dimensions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensionKey: dimKey,
          data: {},
          scores: {
            contentScore: existing?.contentScore ?? 0,
            selfScore: existing?.selfScore ?? 0,
            reviewScore: value,
          },
        }),
      });
    } catch { /* ignore */ }
  }, [opportunityId, scoreMap]);

  const activeDims = DIMENSIONS.filter((d) => (d.stages as readonly string[]).includes(currentStage));
  const totalWeight = activeDims.length;
  const weightedSum = activeDims.reduce((sum, d) => {
    const s = scoreMap[d.key];
    return sum + (s ? s.contentScore : 0);
  }, 0);
  const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const winRate = Math.min(Math.round(avgScore * 10), 100);

  return (
    <div className="space-y-4">
      <GlassCard>
        <h4 className="text-sm font-semibold text-slate-800 mb-4">十维度评估总表</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-slate-500 font-medium">维度</th>
              <th className="text-center py-2 px-3 text-slate-500 font-medium">内容得分</th>
              <th className="text-center py-2 px-3 text-slate-500 font-medium">自评得分</th>
              <th className="text-center py-2 px-3 text-slate-500 font-medium">评审得分</th>
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((dim) => {
              const isActive = (dim.stages as readonly string[]).includes(currentStage);
              const score = scoreMap[dim.key];
              return (
                <tr
                  key={dim.key}
                  className={cn(
                    'border-b border-slate-50',
                    !isActive && 'opacity-40'
                  )}
                >
                  <td className="py-2.5 px-3 text-slate-700">{dim.label}</td>
                  <td className="py-2.5 px-3 text-center">
                    <ScoreCell value={score?.contentScore} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <ScoreCell value={score?.selfScore} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {isActive && opportunityId ? (
                      <ReviewScoreInput
                        value={localReview[dim.key] ?? score?.reviewScore ?? 0}
                        onChange={(v) => handleReviewChange(dim.key, v)}
                      />
                    ) : (
                      <ScoreCell value={score?.reviewScore} highlight />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <p className="text-sm text-slate-500">综合得分</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {avgScore.toFixed(1)}
          </p>
          <p className="text-xs text-slate-400 mt-1">满分 10.0</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-sm text-slate-500">赢单率预测</p>
          <p className="text-3xl font-bold text-primary mt-1">{winRate}%</p>
          <p className="text-xs text-slate-400 mt-1">基于AI综合分析</p>
        </GlassCard>
      </div>
    </div>
  );
}

function ScoreCell({ value, highlight }: { value?: number; highlight?: boolean }) {
  if (!value) return <span className="text-slate-300">-</span>;
  return (
    <span className={cn(
      'font-medium',
      highlight ? 'text-primary' : 'text-slate-700'
    )}>
      {value}
    </span>
  );
}

function ReviewScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value || ''));

  const handleBlur = () => {
    setEditing(false);
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      onChange(Math.round(num * 10) / 10);
    } else {
      setDraft(String(value || ''));
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(String(value || '')); setEditing(true); }}
        className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded border border-dashed border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors cursor-pointer"
      >
        {value ? value : <span className="text-primary/40">填写</span>}
      </button>
    );
  }

  return (
    <input
      type="number"
      min={0}
      max={10}
      step={0.1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
      autoFocus
      className="w-16 rounded border border-primary bg-white px-2 py-0.5 text-center text-sm font-medium text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
    />
  );
}
