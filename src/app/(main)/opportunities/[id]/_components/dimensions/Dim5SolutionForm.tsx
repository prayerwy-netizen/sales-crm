'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface Iteration {
  id: number;
  date: string;
  needsAnalysis: string;
  solution: string;
  expectedBenefits: string;
  presenter: string;
  approvalRate: number;
}

const emptyIteration = (): Iteration => ({
  id: Date.now() + Math.random(),
  date: '',
  needsAnalysis: '',
  solution: '',
  expectedBenefits: '',
  presenter: '',
  approvalRate: 0,
});

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '客户完全认可解决方案，准备签约' },
  { grade: 'B' as const, label: '客户基本认可，需小幅调整' },
  { grade: 'C' as const, label: '客户部分认可，需要较大修改' },
  { grade: 'D' as const, label: '客户对方案不满意' },
  { grade: 'E' as const, label: '无法判断' },
];

export function Dim5SolutionForm({ opportunityId }: { opportunityId?: string }) {
  const [department, setDepartment] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [iterations, setIterations] = useState<Iteration[]>([emptyIteration()]);
  const [otherNotes, setOtherNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim5');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.department) setDepartment(initialData.department as string);
    if (initialData.productInfo) setProductInfo(initialData.productInfo as string);
    if (initialData.iterations) setIterations(initialData.iterations as Iteration[]);
    if (initialData.otherNotes) setOtherNotes(initialData.otherNotes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    department, productInfo,
    maxApprovalRate: Math.max(0, ...iterations.map(i => i.approvalRate)),
    iterationCount: iterations.length,
  }), [department, productInfo, iterations]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim5',
    dimensionLabel: '解决方案',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && !department && !productInfo) return;
    saveData({ department, productInfo, iterations, otherNotes, selfGrade, actionPlans });
  }, [department, productInfo, iterations, otherNotes, selfGrade, actionPlans, saveData, initialData]);

  const add = () => setIterations((prev) => [...prev, emptyIteration()]);
  const remove = (id: number) => setIterations((prev) => prev.filter((i) => i.id !== id));
  const update = (id: number, field: keyof Iteration, value: string | number) =>
    setIterations((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const scores = useMemo(() => {
    const maxApproval = Math.max(0, ...iterations.map((i) => i.approvalRate));
    const converted = Math.round(maxApproval / 10);
    return { maxApproval, converted };
  }, [iterations]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        记录方案迭代过程和客户认可程度。评分：取最高客户认可度，转换为0-10分（认可度% / 10）
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Input label="牵头产品部" placeholder="负责该方案的产品部门" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <Input label="产品信息" placeholder="涉及的产品名称/型号" value={productInfo} onChange={(e) => setProductInfo(e.target.value)} />
      </div>

      {/* 方案迭代记录 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">方案迭代记录</label>
          <Button variant="ghost" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            添加迭代
          </Button>
        </div>

        {iterations.map((iter, idx) => (
          <IterationCard
            key={iter.id}
            index={idx}
            iteration={iter}
            onUpdate={(field, value) => update(iter.id, field, value)}
            onRemove={() => remove(iter.id)}
            canRemove={iterations.length > 1}
          />
        ))}
      </div>

      {/* 其他说明 */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他说明</label>
        <textarea
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="补充说明解决方案相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={[
          { label: '最高认可度', value: `${scores.maxApproval}%` },
          { label: '转换得分', value: scores.converted, suffix: '/ 10' },
        ]}
        total={scores.converted}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function IterationCard({
  index, iteration, onUpdate, onRemove, canRemove,
}: {
  index: number;
  iteration: Iteration;
  onUpdate: (field: keyof Iteration, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">第 {index + 1} 次迭代</span>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="汇报日期" type="date" value={iteration.date} onChange={(e) => onUpdate('date', e.target.value)} />
        <Input label="汇报人" placeholder="汇报人姓名" value={iteration.presenter} onChange={(e) => onUpdate('presenter', e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">需求分析</label>
        <textarea rows={2} value={iteration.needsAnalysis} onChange={(e) => onUpdate('needsAnalysis', e.target.value)}
          placeholder="本次迭代的需求分析..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">解决方案</label>
        <textarea rows={2} value={iteration.solution} onChange={(e) => onUpdate('solution', e.target.value)}
          placeholder="本次迭代的解决方案..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">预期收益</label>
        <textarea rows={2} value={iteration.expectedBenefits} onChange={(e) => onUpdate('expectedBenefits', e.target.value)}
          placeholder="本次方案的预期收益..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">客户认可程度: {iteration.approvalRate}%</label>
        <input type="range" min={0} max={100} step={5} value={iteration.approvalRate}
          onChange={(e) => onUpdate('approvalRate', Number(e.target.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0% 不认可</span><span>50%</span><span>100% 完全认可</span>
        </div>
      </div>
    </div>
  );
}
