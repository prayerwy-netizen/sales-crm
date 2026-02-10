'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface DimensionMetrics {
  standardization: number;
  deliverability: number;
}

const achieveOptions = [
  { value: '', label: '请选择' },
  { value: 'can', label: '可以满足（10分）' },
  { value: 'mostly', label: '基本满足（8分）' },
  { value: 'uncertain', label: '不确定（0分）' },
  { value: 'cannot', label: '无法满足（0分）' },
];

const achieveScoreMap: Record<string, number> = {
  can: 10, mostly: 8, uncertain: 0, cannot: 0,
};

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '现有产品需求满足率100%，标准化解决方案，标准化实施' },
  { grade: 'B' as const, label: '现有产品需求满足率大于80%' },
  { grade: 'C' as const, label: '现有产品需求满足率介于50%-80%' },
  { grade: 'D' as const, label: '现有产品需求满足率小于50%' },
  { grade: 'E' as const, label: '无法判断' },
];

export function Dim8DeliveryCapabilityForm({ opportunityId }: { opportunityId?: string }) {
  const [product, setProduct] = useState<DimensionMetrics>({ standardization: 50, deliverability: 50 });
  const [solution, setSolution] = useState<DimensionMetrics>({ standardization: 50, deliverability: 50 });
  const [implementation, setImplementation] = useState<DimensionMetrics>({ standardization: 50, deliverability: 50 });
  const [milestone, setMilestone] = useState('');
  const [canAchieve, setCanAchieve] = useState('');
  const [otherNotes, setOtherNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim8');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.product) setProduct(initialData.product as DimensionMetrics);
    if (initialData.solution) setSolution(initialData.solution as DimensionMetrics);
    if (initialData.implementation) setImplementation(initialData.implementation as DimensionMetrics);
    if (initialData.milestone) setMilestone(initialData.milestone as string);
    if (initialData.canAchieve) setCanAchieve(initialData.canAchieve as string);
    if (initialData.otherNotes) setOtherNotes(initialData.otherNotes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    productStd: product.standardization, productDel: product.deliverability,
    solutionStd: solution.standardization, solutionDel: solution.deliverability,
    implStd: implementation.standardization, implDel: implementation.deliverability,
    milestone, canAchieve,
  }), [product, solution, implementation, milestone, canAchieve]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim8',
    dimensionLabel: '交付能力',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && !milestone && !canAchieve) return;
    saveData({ product, solution, implementation, milestone, canAchieve, otherNotes, selfGrade, actionPlans });
  }, [product, solution, implementation, milestone, canAchieve, otherNotes, selfGrade, actionPlans, saveData, initialData]);

  const scores = useMemo(() => {
    // 标准化 = 三项平均值 ÷ 10
    const stdAvg = (product.standardization + solution.standardization + implementation.standardization) / 3;
    const stdScore = parseFloat((stdAvg / 10).toFixed(1));

    // 可交付 = 三项平均值 ÷ 10
    const delAvg = (product.deliverability + solution.deliverability + implementation.deliverability) / 3;
    const delScore = parseFloat((delAvg / 10).toFixed(1));

    // 节点 = 有日期10分，无日期0分
    const milestoneScore = milestone ? 10 : 0;

    // 达成 = 选项得分
    const achieveScore = achieveScoreMap[canAchieve] ?? 0;

    // 合计 = 标准化(0.3) + 可交付(0.3) + 节点(0.1) + 达成(0.3)
    const total = stdScore * 0.3 + delScore * 0.3 + milestoneScore * 0.1 + achieveScore * 0.3;

    return {
      stdScore, delScore, milestoneScore, achieveScore,
      total: parseFloat(total.toFixed(1)),
    };
  }, [product, solution, implementation, milestone, canAchieve]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估产品、方案、实施三个维度的交付能力。权重：标准化(0.3) + 可交付(0.3) + 节点(0.1) + 达成(0.3)
      </p>

      <MetricsRow label="产品维度" metrics={product} onChange={setProduct} />
      <MetricsRow label="解决方案维度" metrics={solution} onChange={setSolution} />
      <MetricsRow label="实施维度" metrics={implementation} onChange={setImplementation} />

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <Input
          label="客户期望交付节点"
          type="date"
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        />
        <Select
          label="我们是否可以达成"
          options={achieveOptions}
          value={canAchieve}
          onChange={(e) => setCanAchieve(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他说明</label>
        <textarea
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="补充说明交付能力相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={[
          { label: '标准化', value: scores.stdScore, weight: 0.3 },
          { label: '可交付', value: scores.delScore, weight: 0.3 },
          { label: '节点', value: scores.milestoneScore, weight: 0.1 },
          { label: '达成', value: scores.achieveScore, weight: 0.3 },
        ]}
        total={scores.total}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function MetricsRow({
  label, metrics, onChange,
}: {
  label: string;
  metrics: DimensionMetrics;
  onChange: (m: DimensionMetrics) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="grid grid-cols-2 gap-4">
        <SliderField
          label="标准化程度"
          value={metrics.standardization}
          onChange={(v) => onChange({ ...metrics, standardization: v })}
        />
        <SliderField
          label="可交付程度"
          value={metrics.deliverability}
          onChange={(v) => onChange({ ...metrics, deliverability: v })}
        />
      </div>
    </div>
  );
}

function SliderField({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}: {value}%
      </label>
      <input
        type="range" min={0} max={100} step={5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
