'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface BenefitItem {
  id: number;
  content: string;
  method: string;
  valid: boolean;
}

const emptyBenefit = (): BenefitItem => ({
  id: Date.now() + Math.random(),
  content: '',
  method: '',
  valid: true,
});

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '价值主张清晰且客户高度认同' },
  { grade: 'B' as const, label: '价值主张较清晰，客户基本认同' },
  { grade: 'C' as const, label: '价值主张初步成型，客户部分认同' },
  { grade: 'D' as const, label: '价值主张不够清晰' },
  { grade: 'E' as const, label: '无法判断' },
];

function getListScore(items: BenefitItem[]): number {
  const count = items.filter((i) => i.content.trim() && i.valid).length;
  if (count >= 3) return 10;
  if (count === 2) return 8;
  if (count === 1) return 6;
  return 0;
}

export function Dim6ValuePropositionForm({ opportunityId }: { opportunityId?: string }) {
  const [quantitative, setQuantitative] = useState<BenefitItem[]>([emptyBenefit()]);
  const [qualitative, setQualitative] = useState<BenefitItem[]>([emptyBenefit()]);
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim6');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.quantitative) setQuantitative(initialData.quantitative as BenefitItem[]);
    if (initialData.qualitative) setQualitative(initialData.qualitative as BenefitItem[]);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    quantitative: quantitative.filter(i => i.content.trim()).map(i => i.content),
    qualitative: qualitative.filter(i => i.content.trim()).map(i => i.content),
  }), [quantitative, qualitative]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim6',
    dimensionLabel: '价值主张',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && quantitative.every(i => !i.content.trim())) return;
    saveData({ quantitative, qualitative, selfGrade, actionPlans });
  }, [quantitative, qualitative, selfGrade, actionPlans, saveData, initialData]);

  const scores = useMemo(() => {
    const quantScore = getListScore(quantitative);
    const qualScore = getListScore(qualitative);
    const allValid = [
      ...quantitative.filter((i) => i.content.trim() && i.valid),
      ...qualitative.filter((i) => i.content.trim() && i.valid),
    ].length;
    const totalScore = allValid >= 3 ? 10 : allValid === 2 ? 8 : allValid === 1 ? 6 : 0;
    const weighted = quantScore * 0.3 + qualScore * 0.3 + totalScore * 0.4;
    return { quantScore, qualScore, totalScore, weighted: parseFloat(weighted.toFixed(1)) };
  }, [quantitative, qualitative]);

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        梳理为客户带来的定量和定性收益。评分：定量(0.3) + 定性(0.3) + 合计(0.4)
      </p>

      <BenefitList label="定量收益" description="可量化的收益，如成本降低、效率提升等" items={quantitative} onChange={setQuantitative} />
      <BenefitList label="定性收益" description="难以量化但有价值的收益，如品牌提升、合规保障等" items={qualitative} onChange={setQualitative} />

      <ScorePanel
        items={[
          { label: '定量', value: scores.quantScore, weight: 0.3 },
          { label: '定性', value: scores.qualScore, weight: 0.3 },
          { label: '合计', value: scores.totalScore, weight: 0.4 },
        ]}
        total={scores.weighted}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function BenefitList({ label, description, items, onChange }: {
  label: string;
  description: string;
  items: BenefitItem[];
  onChange: (items: BenefitItem[]) => void;
}) {
  const add = () => onChange([...items, emptyBenefit()]);
  const remove = (id: number) => onChange(items.filter((i) => i.id !== id));
  const update = (id: number, field: keyof BenefitItem, value: string | boolean) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const validCount = items.filter((i) => i.content.trim() && i.valid).length;
  const score = getListScore(items);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-slate-700">
            {label}
            <span className="ml-2 text-xs text-slate-400">({validCount}条有效，{score}分)</span>
          </label>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          添加
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={item.id} className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{idx + 1}.</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => update(item.id, 'valid', !item.valid)}
                className={`p-1 rounded transition-colors cursor-pointer ${item.valid ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
                title={item.valid ? '标记为无效' : '标记为有效'}
              >
                {item.valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
              {items.length > 1 && (
                <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <textarea
            rows={2}
            value={item.content}
            onChange={(e) => update(item.id, 'content', e.target.value)}
            placeholder="收益内容描述..."
            className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${item.valid ? 'border-slate-300' : 'border-slate-200 opacity-50'}`}
          />
          <textarea
            rows={1}
            value={item.method}
            onChange={(e) => update(item.id, 'method', e.target.value)}
            placeholder="验证方法..."
            className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${item.valid ? 'border-slate-300' : 'border-slate-200 opacity-50'}`}
          />
        </div>
      ))}
    </div>
  );
}
