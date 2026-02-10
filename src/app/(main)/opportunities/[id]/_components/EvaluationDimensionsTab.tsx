'use client';

import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui';
import { DIMENSIONS } from '@/lib/constants';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StageKey, DimensionKey } from '@/lib/constants';
import type { DimensionScore } from '@/types/opportunity';
import { getRequiredDimensions, matchConfig } from '@/lib/parameterConfig';
import {
  Dim1PurchaseIntentForm,
  Dim2CustomerRelationshipForm,
  Dim3NeedsAnalysisForm,
  Dim4CompetitionForm,
  Dim5SolutionForm,
  Dim6ValuePropositionForm,
  Dim7DeliveryTeamForm,
  Dim8DeliveryCapabilityForm,
  Dim9PricingStrategyForm,
  Dim10ProfitMarginForm,
} from './dimensions';

interface EvaluationDimensionsTabProps {
  currentStage: StageKey;
  scores: DimensionScore[];
  opportunityId?: string;
  productLine?: string;
  expectedAmount?: number;
}

export function EvaluationDimensionsTab({ currentStage, scores, opportunityId, productLine, expectedAmount }: EvaluationDimensionsTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const scoreMap = Object.fromEntries(scores.map((s) => [s.dimensionKey, s]));

  const { requiredKeys, config } = useMemo(() => {
    if (productLine && expectedAmount != null) {
      const cfg = matchConfig(productLine, expectedAmount);
      const keys = getRequiredDimensions(productLine, expectedAmount, currentStage);
      return { requiredKeys: new Set(keys), config: cfg };
    }
    // 回退：使用静态 DIMENSIONS stages
    const fallbackKeys = DIMENSIONS
      .filter((d) => (d.stages as readonly string[]).includes(currentStage))
      .map((d) => d.key);
    return { requiredKeys: new Set(fallbackKeys), config: null };
  }, [productLine, expectedAmount, currentStage]);

  const activeDimensions = DIMENSIONS.filter((d) => requiredKeys.has(d.key));

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const levelLabel: Record<string, string> = {
    simplified: '简化评估',
    standard: '标准评估',
    complete: '完整评估',
  };

  return (
    <div className="space-y-3">
      {config && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-xs text-slate-600">
          <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>
            当前匹配：<span className="font-medium text-slate-800">{config.amountRange}</span>
            {' · '}
            <span className="font-medium text-primary">{levelLabel[config.evalLevel]}</span>
            {' · '}
            本阶段需填 {activeDimensions.length} 个维度
          </span>
        </div>
      )}
      {activeDimensions.map((dim) => {
        const score = scoreMap[dim.key];
        const isOpen = expanded === dim.key;

        return (
          <DimensionCard
            key={dim.key}
            label={dim.label}
            dimKey={dim.key}
            score={score}
            isOpen={isOpen}
            onToggle={() => toggle(dim.key)}
            opportunityId={opportunityId}
          />
        );
      })}
    </div>
  );
}

interface DimensionCardProps {
  label: string;
  dimKey: string;
  score?: DimensionScore;
  isOpen: boolean;
  onToggle: () => void;
  opportunityId?: string;
}

function DimensionCard({ label, dimKey, score, isOpen, onToggle, opportunityId }: DimensionCardProps) {
  return (
    <GlassCard className="p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          {score && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">
                内容: <span className="text-slate-700 font-medium">{score.contentScore}</span>
              </span>
              <span className="text-slate-400">
                自评: <span className="text-slate-700 font-medium">{score.selfScore}</span>
              </span>
              {score.reviewScore > 0 && (
                <span className="text-slate-400">
                  评审: <span className="text-primary font-medium">{score.reviewScore}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <DimensionForm dimKey={dimKey} score={score} opportunityId={opportunityId} />
        </div>
      )}
    </GlassCard>
  );
}

function DimensionForm({ dimKey, score, opportunityId }: { dimKey: string; score?: DimensionScore; opportunityId?: string }) {
  const formMap: Record<string, React.ReactNode> = {
    dim1: <Dim1PurchaseIntentForm opportunityId={opportunityId} />,
    dim2: <Dim2CustomerRelationshipForm opportunityId={opportunityId} />,
    dim3: <Dim3NeedsAnalysisForm opportunityId={opportunityId} />,
    dim4: <Dim4CompetitionForm opportunityId={opportunityId} />,
    dim5: <Dim5SolutionForm opportunityId={opportunityId} />,
    dim6: <Dim6ValuePropositionForm opportunityId={opportunityId} />,
    dim7: <Dim7DeliveryTeamForm opportunityId={opportunityId} />,
    dim8: <Dim8DeliveryCapabilityForm opportunityId={opportunityId} />,
    dim9: <Dim9PricingStrategyForm opportunityId={opportunityId} />,
    dim10: <Dim10ProfitMarginForm opportunityId={opportunityId} />,
  };

  return (
    <div className="pt-4 space-y-4">
      {/* 维度专属表单 */}
      {formMap[dimKey] ?? (
        <p className="text-xs text-slate-400">未知维度（{dimKey}）</p>
      )}

      {/* 得分区域 */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">内容得分</label>
          <div className="text-lg font-bold text-slate-800">
            {score?.contentScore ?? '-'}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">自评得分</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            defaultValue={score?.selfScore ?? ''}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            placeholder="0-10"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">评审得分</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            defaultValue={score?.reviewScore || ''}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            placeholder="0-10"
          />
        </div>
      </div>
    </div>
  );
}
