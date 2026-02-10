'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

const categoryOptions = [
  { value: '', label: '请选择客户分类' },
  { value: 'stable', label: '稳定客户（10分）' },
  { value: 'opportunity', label: '机会客户（8分）' },
  { value: 'new', label: '全新客户（6分）' },
];

const budgetOptions = [
  { value: '', label: '请选择' },
  { value: 'yes', label: '是（10分）' },
  { value: 'no', label: '否（1分）' },
];

const categoryScoreMap: Record<string, number> = { stable: 10, opportunity: 8, new: 6 };
const budgetScoreMap: Record<string, number> = { yes: 10, no: 1 };

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '客户已明确采购计划和预算' },
  { grade: 'B' as const, label: '客户有采购意向但预算未落实' },
  { grade: 'C' as const, label: '客户有需求但尚未列入计划' },
  { grade: 'D' as const, label: '客户需求不明确' },
  { grade: 'E' as const, label: '无法判断' },
];

export function Dim1PurchaseIntentForm({ opportunityId }: { opportunityId?: string }) {
  const [category, setCategory] = useState('');
  const [hasBudget, setHasBudget] = useState('');
  const [approvalDate, setApprovalDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim1');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.category) setCategory(initialData.category as string);
    if (initialData.hasBudget) setHasBudget(initialData.hasBudget as string);
    if (initialData.approvalDate) setApprovalDate(initialData.approvalDate as string);
    if (initialData.notes) setNotes(initialData.notes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    category, hasBudget, approvalDate, notes,
  }), [category, hasBudget, approvalDate, notes]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim1',
    dimensionLabel: '客户购买意愿',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && !category && !hasBudget) return;
    saveData({ category, hasBudget, approvalDate, notes, selfGrade, actionPlans });
  }, [category, hasBudget, approvalDate, notes, selfGrade, actionPlans, saveData, initialData]);

  const scores = useMemo(() => {
    const catScore = categoryScoreMap[category] ?? null;
    const budScore = budgetScoreMap[hasBudget] ?? null;
    const dateScore = approvalDate ? 10 : 0;
    const notesScore = notes.trim() ? 10 : 0;

    if (catScore === null && budScore === null) return null;

    const total =
      (catScore ?? 0) * 0.3 +
      (budScore ?? 0) * 0.3 +
      dateScore * 0.3 +
      notesScore * 0.1;

    return { catScore, budScore, dateScore, notesScore, total: parseFloat(total.toFixed(1)) };
  }, [category, hasBudget, approvalDate, notes]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估客户购买意愿强度。权重：客户分类(0.3) + 资金计划(0.3) + 批复日期(0.3) + 其他(0.1)
      </p>

      <Select
        label="客户分类"
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Select
        label="是否有资金计划"
        options={budgetOptions}
        value={hasBudget}
        onChange={(e) => setHasBudget(e.target.value)}
      />

      <Input
        label="资金计划批复日期"
        type="date"
        value={approvalDate}
        onChange={(e) => setApprovalDate(e.target.value)}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他说明</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="补充说明客户购买意愿相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={[
          { label: '客户分类', value: scores?.catScore ?? null, weight: 0.3 },
          { label: '资金计划', value: scores?.budScore ?? null, weight: 0.3 },
          { label: '批复日期', value: scores?.dateScore ?? null, weight: 0.3 },
          { label: '其他', value: scores?.notesScore ?? null, weight: 0.1 },
        ]}
        total={scores?.total ?? null}
      />

      <SelfAssessment
        options={selfAssessmentOptions}
        value={selfGrade}
        onChange={setSelfGrade}
      />

      <ActionPlanTable
        items={actionPlans}
        onChange={setActionPlans}
        onRequestAI={requestAI}
        aiLoading={aiLoading}
      />
    </div>
  );
}
