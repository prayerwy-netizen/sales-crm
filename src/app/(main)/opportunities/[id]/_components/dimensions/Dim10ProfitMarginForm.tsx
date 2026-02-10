'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

const meetsOptions = [
  { value: '', label: '请选择' },
  { value: 'yes', label: '是（10分）' },
  { value: 'no', label: '否（0分）' },
];

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '利润率优秀，远超公司要求' },
  { grade: 'B' as const, label: '利润率良好，达到公司要求' },
  { grade: 'C' as const, label: '利润率一般，接近公司底线' },
  { grade: 'D' as const, label: '利润率偏低，低于公司要求' },
  { grade: 'E' as const, label: '无法判断' },
];

function getMarginTierScore(rate: number): number {
  if (rate >= 60) return 10;
  if (rate >= 50) return 8;
  if (rate >= 40) return 6;
  if (rate >= 30) return 5;
  if (rate >= 20) return 3;
  return 0;
}

export function Dim10ProfitMarginForm({ opportunityId }: { opportunityId?: string }) {
  const [expectedAmount, setExpectedAmount] = useState('');
  const [grossProfit, setGrossProfit] = useState('');
  const [meetsRequirement, setMeetsRequirement] = useState('');
  const [otherNotes, setOtherNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim10');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.expectedAmount) setExpectedAmount(initialData.expectedAmount as string);
    if (initialData.grossProfit) setGrossProfit(initialData.grossProfit as string);
    if (initialData.meetsRequirement) setMeetsRequirement(initialData.meetsRequirement as string);
    if (initialData.otherNotes) setOtherNotes(initialData.otherNotes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  // Auto-save
  useEffect(() => {
    if (!initialData && !expectedAmount && !grossProfit) return;
    saveData({ expectedAmount, grossProfit, meetsRequirement, otherNotes, selfGrade, actionPlans });
  }, [expectedAmount, grossProfit, meetsRequirement, otherNotes, selfGrade, actionPlans, saveData, initialData]);

  const marginRate = useMemo(() => {
    const amount = parseFloat(expectedAmount);
    const profit = parseFloat(grossProfit);
    if (!amount || amount === 0 || !profit) return null;
    return parseFloat(((profit / amount) * 100).toFixed(1));
  }, [expectedAmount, grossProfit]);

  const getFormData = useCallback(() => ({
    expectedAmount, grossProfit, marginRate, meetsRequirement,
  }), [expectedAmount, grossProfit, marginRate, meetsRequirement]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim10',
    dimensionLabel: '利润率',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  const scores = useMemo(() => {
    const tierScore = marginRate !== null ? getMarginTierScore(marginRate) : null;
    const meetsScore = meetsRequirement === 'yes' ? 10 : meetsRequirement === 'no' ? 0 : null;

    let total: number | null = null;
    if (tierScore !== null && meetsScore !== null) {
      total = parseFloat((tierScore * 0.6 + meetsScore * 0.4).toFixed(1));
    }

    return { tierScore, meetsScore, total };
  }, [marginRate, meetsRequirement]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估项目利润率。评分：毛利率档位(0.6) + 是否达标(0.4)。
        档位：≥60%=10, 50-60%=8, 40-50%=6, 30-40%=5, 20-30%=3, &lt;20%=0
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="预期签单金额（万元）"
          type="number" min={0} step={0.01}
          placeholder="输入金额"
          value={expectedAmount}
          onChange={(e) => setExpectedAmount(e.target.value)}
        />
        <Input
          label="预估毛利（万元）"
          type="number" min={0} step={0.01}
          placeholder="输入毛利"
          value={grossProfit}
          onChange={(e) => setGrossProfit(e.target.value)}
        />
      </div>

      {/* 自动计算毛利率 */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500">预估毛利率</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {marginRate !== null ? `${marginRate}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">档位得分</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {scores.tierScore ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">权重</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">×0.6</p>
          </div>
        </div>
      </div>

      <Select
        label="毛利率是否达到要求"
        options={meetsOptions}
        value={meetsRequirement}
        onChange={(e) => setMeetsRequirement(e.target.value)}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他说明</label>
        <textarea
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="补充说明利润率相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={[
          { label: '档位', value: scores.tierScore, weight: 0.6 },
          { label: '达标', value: scores.meetsScore, weight: 0.4 },
        ]}
        total={scores.total}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}
