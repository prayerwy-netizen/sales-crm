'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface ListItem {
  id: number;
  content: string;
  valid: boolean;
}

const newItem = (): ListItem => ({ id: Date.now() + Math.random(), content: '', valid: true });

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '完全掌握客户核心痛点、需求和目标' },
  { grade: 'B' as const, label: '基本了解客户需求，部分目标待确认' },
  { grade: 'C' as const, label: '初步了解客户痛点，需求和目标不够清晰' },
  { grade: 'D' as const, label: '对客户需求了解有限' },
  { grade: 'E' as const, label: '无法判断' },
];

function getListScore(items: ListItem[]): number {
  const count = items.filter((i) => i.content.trim() && i.valid).length;
  if (count >= 3) return 10;
  if (count === 2) return 8;
  if (count === 1) return 6;
  return 0;
}

export function Dim3NeedsAnalysisForm({ opportunityId }: { opportunityId?: string }) {
  const [painPoints, setPainPoints] = useState<ListItem[]>([newItem()]);
  const [requirements, setRequirements] = useState<ListItem[]>([newItem()]);
  const [goals, setGoals] = useState<ListItem[]>([newItem()]);
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim3');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.painPoints) setPainPoints(initialData.painPoints as ListItem[]);
    if (initialData.requirements) setRequirements(initialData.requirements as ListItem[]);
    if (initialData.goals) setGoals(initialData.goals as ListItem[]);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    painPoints: painPoints.filter(i => i.content.trim()).map(i => i.content),
    requirements: requirements.filter(i => i.content.trim()).map(i => i.content),
    goals: goals.filter(i => i.content.trim()).map(i => i.content),
  }), [painPoints, requirements, goals]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim3',
    dimensionLabel: '需求分析',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && painPoints.every(i => !i.content.trim())) return;
    saveData({ painPoints, requirements, goals, selfGrade, actionPlans });
  }, [painPoints, requirements, goals, selfGrade, actionPlans, saveData, initialData]);

  const scores = useMemo(() => {
    const painScore = getListScore(painPoints);
    const reqScore = getListScore(requirements);
    const goalScore = getListScore(goals);
    const total = painScore * 0.3 + reqScore * 0.3 + goalScore * 0.4;
    return { painScore, reqScore, goalScore, total: parseFloat(total.toFixed(1)) };
  }, [painPoints, requirements, goals]);

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        深入分析客户痛点、需求和目标。评分规则：有效条目1条=6分，2条=8分，3条及以上=10分。权重：痛点(0.3) + 需求(0.3) + 目标(0.4)
      </p>

      <EditableList label="客户痛点" placeholder="描述客户当前面临的痛点..." items={painPoints} onChange={setPainPoints} />
      <EditableList label="客户需求" placeholder="描述客户的具体需求..." items={requirements} onChange={setRequirements} />
      <EditableList label="客户目标" placeholder="描述客户期望达成的目标..." items={goals} onChange={setGoals} />

      <ScorePanel
        items={[
          { label: '痛点', value: scores.painScore, weight: 0.3 },
          { label: '需求', value: scores.reqScore, weight: 0.3 },
          { label: '目标', value: scores.goalScore, weight: 0.4 },
        ]}
        total={scores.total}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function EditableList({ label, placeholder, items, onChange }: {
  label: string;
  placeholder: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}) {
  const add = () => onChange([...items, newItem()]);
  const remove = (id: number) => onChange(items.filter((i) => i.id !== id));
  const update = (id: number, field: 'content' | 'valid', value: string | boolean) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const validCount = items.filter((i) => i.content.trim() && i.valid).length;
  const score = getListScore(items);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label}
          <span className="ml-2 text-xs text-slate-400">({validCount}条有效，{score}分)</span>
        </label>
        <Button variant="ghost" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          添加
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-2 items-start">
          <span className="mt-2 text-xs text-slate-400 w-5 shrink-0">{idx + 1}.</span>
          <textarea
            rows={2}
            value={item.content}
            onChange={(e) => update(item.id, 'content', e.target.value)}
            placeholder={placeholder}
            className={`flex-1 rounded-lg border bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${item.valid ? 'border-slate-300' : 'border-slate-200 opacity-50'}`}
          />
          <button
            type="button"
            onClick={() => update(item.id, 'valid', !item.valid)}
            className={`mt-2 p-1 rounded transition-colors cursor-pointer ${item.valid ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
            title={item.valid ? '标记为无效' : '标记为有效'}
          >
            {item.valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          {items.length > 1 && (
            <button onClick={() => remove(item.id)} className="mt-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
