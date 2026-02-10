'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface StrategyItem {
  key: string;
  label: string;
  content: string;
  selfScore: number;
}

const initialItems: StrategyItem[] = [
  { key: 'priceValue', label: '报价与价值匹配情况', content: '', selfScore: 50 },
  { key: 'competitorPricing', label: '竞争对手定价及竞争优势', content: '', selfScore: 50 },
  { key: 'salesModel', label: '销售模式合理性', content: '', selfScore: 50 },
  { key: 'pricingStrategy', label: '定价策略', content: '', selfScore: 50 },
  { key: 'paymentTerms', label: '付款方式', content: '', selfScore: 50 },
];

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '报价策略完善，客户认可度高' },
  { grade: 'B' as const, label: '报价策略基本合理，有一定竞争力' },
  { grade: 'C' as const, label: '报价策略需要优化' },
  { grade: 'D' as const, label: '报价策略存在明显问题' },
  { grade: 'E' as const, label: '无法判断' },
];

export function Dim9PricingStrategyForm({ opportunityId }: { opportunityId?: string }) {
  const [items, setItems] = useState<StrategyItem[]>(initialItems);
  const [otherNotes, setOtherNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim9');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.items) setItems(initialData.items as StrategyItem[]);
    if (initialData.otherNotes) setOtherNotes(initialData.otherNotes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    items: items.map(i => ({ label: i.label, hasContent: !!i.content.trim(), selfScore: i.selfScore })),
  }), [items]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim9',
    dimensionLabel: '报价策略',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && items.every(i => !i.content.trim())) return;
    saveData({ items, otherNotes, selfGrade, actionPlans });
  }, [items, otherNotes, selfGrade, actionPlans, saveData, initialData]);

  const update = (key: string, field: 'content' | 'selfScore', value: string | number) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const scores = useMemo(() => {
    // 每项: 内容(50%) + 自评(50%)，5项等权加权汇总后转换为10分制
    const itemScores = items.map((item) => {
      const contentScore = item.content.trim() ? 1 : 0; // 有内容=1, 无内容=0
      const selfNormalized = item.selfScore / 100; // 0~1
      return (contentScore * 0.5 + selfNormalized * 0.5);
    });
    const avg = itemScores.reduce((a, b) => a + b, 0) / itemScores.length;
    const total = parseFloat((avg * 10).toFixed(1));
    return { itemScores, total };
  }, [items]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估报价策略的合理性。每项：内容(50%) + 自评(50%)，5项等权加权汇总转换为10分制。
      </p>

      {items.map((item) => (
        <StrategyCard
          key={item.key}
          item={item}
          onContentChange={(v) => update(item.key, 'content', v)}
          onScoreChange={(v) => update(item.key, 'selfScore', v)}
        />
      ))}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他说明</label>
        <textarea
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="补充说明报价策略相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={items.map((item, idx) => ({
          label: item.label.slice(0, 4),
          value: parseFloat((scores.itemScores[idx] * 10).toFixed(1)),
        }))}
        total={scores.total}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function StrategyCard({
  item, onContentChange, onScoreChange,
}: {
  item: StrategyItem;
  onContentChange: (v: string) => void;
  onScoreChange: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-2">
      <label className="block text-sm font-medium text-slate-700">{item.label}</label>
      <textarea
        rows={2}
        value={item.content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={`描述${item.label}的具体情况...`}
        className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <div className="space-y-1">
        <label className="block text-xs text-slate-500">
          自评得分: {item.selfScore}%
        </label>
        <input
          type="range" min={0} max={100} step={5} value={item.selfScore}
          onChange={(e) => onScoreChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}
