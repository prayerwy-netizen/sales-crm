'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface Competitor {
  id: number;
  name: string;
  ourAdvantage: string;
  ourDisadvantage: string;
  theirAdvantage: string;
  theirDisadvantage: string;
}

const emptyCompetitor = (): Competitor => ({
  id: Date.now() + Math.random(),
  name: '',
  ourAdvantage: '',
  ourDisadvantage: '',
  theirAdvantage: '',
  theirDisadvantage: '',
});

const comparisonOptions = [
  { value: '', label: '请选择比较结果' },
  { value: 'strong_advantage', label: '明显优势（10分）' },
  { value: 'slight_advantage', label: '略有优势（7分）' },
  { value: 'even', label: '势均力敌（5分）' },
  { value: 'disadvantage', label: '处于劣势（2分）' },
];

const strategyOptions = [
  { value: '', label: '请选择策略方向' },
  { value: 'attack', label: '进攻（10分）' },
  { value: 'defend', label: '防守（6分）' },
  { value: 'observe', label: '观望（3分）' },
];

const comparisonScoreMap: Record<string, number> = {
  strong_advantage: 10, slight_advantage: 7, even: 5, disadvantage: 2,
};
const strategyScoreMap: Record<string, number> = {
  attack: 10, defend: 6, observe: 3,
};

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '竞争优势明显，客户高度认可我方' },
  { grade: 'B' as const, label: '有一定竞争优势，客户倾向我方' },
  { grade: 'C' as const, label: '与竞争对手势均力敌' },
  { grade: 'D' as const, label: '竞争处于劣势' },
  { grade: 'E' as const, label: '无法判断' },
];

export function Dim4CompetitionForm({ opportunityId }: { opportunityId?: string }) {
  const [ourStrengths, setOurStrengths] = useState('');
  const [ourWeaknesses, setOurWeaknesses] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([emptyCompetitor()]);
  const [comparisonResult, setComparisonResult] = useState('');
  const [strategyDirection, setStrategyDirection] = useState('');
  const [theirStrategy, setTheirStrategy] = useState('');
  const [ourStrategy, setOurStrategy] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim4');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.ourStrengths) setOurStrengths(initialData.ourStrengths as string);
    if (initialData.ourWeaknesses) setOurWeaknesses(initialData.ourWeaknesses as string);
    if (initialData.competitors) setCompetitors(initialData.competitors as Competitor[]);
    if (initialData.comparisonResult) setComparisonResult(initialData.comparisonResult as string);
    if (initialData.strategyDirection) setStrategyDirection(initialData.strategyDirection as string);
    if (initialData.theirStrategy) setTheirStrategy(initialData.theirStrategy as string);
    if (initialData.ourStrategy) setOurStrategy(initialData.ourStrategy as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    ourStrengths, ourWeaknesses, comparisonResult, strategyDirection,
    competitors: competitors.filter(c => c.name).map(c => c.name),
  }), [ourStrengths, ourWeaknesses, comparisonResult, strategyDirection, competitors]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim4',
    dimensionLabel: '竞争情况',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && !ourStrengths && !comparisonResult) return;
    saveData({
      ourStrengths, ourWeaknesses, competitors,
      comparisonResult, strategyDirection, theirStrategy, ourStrategy,
      selfGrade, actionPlans,
    });
  }, [ourStrengths, ourWeaknesses, competitors, comparisonResult, strategyDirection, theirStrategy, ourStrategy, selfGrade, actionPlans, saveData, initialData]);

  const add = () => setCompetitors((prev) => [...prev, emptyCompetitor()]);
  const remove = (id: number) => setCompetitors((prev) => prev.filter((c) => c.id !== id));
  const update = (id: number, field: keyof Competitor, value: string) =>
    setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const scores = useMemo(() => {
    const compScore = comparisonScoreMap[comparisonResult] ?? null;
    const stratScore = strategyScoreMap[strategyDirection] ?? null;
    if (compScore === null && stratScore === null) return null;
    const total = (compScore ?? 0) * 0.8 + (stratScore ?? 0) * 0.2;
    return { compScore, stratScore, total: parseFloat(total.toFixed(1)) };
  }, [comparisonResult, strategyDirection]);

  const handleAIStrategy = async () => {
    setStrategyLoading(true);
    try {
      const res = await fetch('/api/ai/competitive-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ourStrengths,
          ourWeaknesses,
          competitors: competitors.filter((c) => c.name),
          comparisonResult,
          strategyDirection,
        }),
      });
      const data = await res.json();
      setStrategyData(data);
    } catch {
      setStrategyData(null);
    } finally {
      setStrategyLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        分析竞争对手情况及我方应对策略。评分：比较结果(80%) + 策略方向(20%)
      </p>

      {/* 公司自身优劣势 */}
      <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
        <span className="text-xs font-medium text-slate-500">公司自身分析</span>
        <div className="grid grid-cols-2 gap-3">
          <TextArea label="我方核心优势" placeholder="我方的核心竞争优势..." value={ourStrengths} onChange={setOurStrengths} />
          <TextArea label="我方主要劣势" placeholder="我方的主要劣势..." value={ourWeaknesses} onChange={setOurWeaknesses} />
        </div>
      </div>

      {/* 竞争对手对比 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">竞争对手对比</label>
          <Button variant="ghost" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            添加竞争对手
          </Button>
        </div>

        {competitors.map((comp, idx) => (
          <CompetitorCard
            key={comp.id}
            index={idx}
            competitor={comp}
            onUpdate={(field, value) => update(comp.id, field, value)}
            onRemove={() => remove(comp.id)}
            canRemove={competitors.length > 1}
          />
        ))}
      </div>

      {/* 比较结果 & 策略 */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <Select label="比较结果（权重80%）" options={comparisonOptions} value={comparisonResult} onChange={(e) => setComparisonResult(e.target.value)} />
        <Select label="策略方向（权重20%）" options={strategyOptions} value={strategyDirection} onChange={(e) => setStrategyDirection(e.target.value)} />
      </div>

      {/* 策略描述 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">策略分析</label>
          <Button variant="outline" size="sm" onClick={handleAIStrategy} disabled={strategyLoading}>
            {strategyLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            AI竞争策略
          </Button>
        </div>
        <TextArea label="竞争对手策略" placeholder="分析竞争对手可能采取的策略..." value={theirStrategy} onChange={setTheirStrategy} />
        <TextArea label="我方应对策略" placeholder="我方针对竞争的应对策略..." value={ourStrategy} onChange={setOurStrategy} />
      </div>

      {/* AI 竞争策略结果 */}
      {strategyData && <AIStrategyResult data={strategyData} />}

      <ScorePanel
        items={[
          { label: '比较结果', value: scores?.compScore ?? null, weight: 0.8 },
          { label: '策略方向', value: scores?.stratScore ?? null, weight: 0.2 },
        ]}
        total={scores?.total ?? null}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function CompetitorCard({ index, competitor, onUpdate, onRemove, canRemove }: {
  index: number;
  competitor: Competitor;
  onUpdate: (field: keyof Competitor, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">竞争对手 {String.fromCharCode(65 + index)}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Input label="竞争对手名称" placeholder="输入竞争对手公司名称" value={competitor.name} onChange={(e) => onUpdate('name', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <TextArea label="我方优势" placeholder="我方相对该对手的优势..." value={competitor.ourAdvantage} onChange={(v) => onUpdate('ourAdvantage', v)} />
        <TextArea label="我方劣势" placeholder="我方相对该对手的劣势..." value={competitor.ourDisadvantage} onChange={(v) => onUpdate('ourDisadvantage', v)} />
        <TextArea label="对手优势" placeholder="该对手的核心优势..." value={competitor.theirAdvantage} onChange={(v) => onUpdate('theirAdvantage', v)} />
        <TextArea label="对手劣势" placeholder="该对手的劣势..." value={competitor.theirDisadvantage} onChange={(v) => onUpdate('theirDisadvantage', v)} />
      </div>
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
    </div>
  );
}

function AIStrategyResult({ data }: { data: any }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-primary" />
        AI 竞争应对策略
      </h4>

      {data.summary && (
        <p className="text-xs text-slate-600 bg-white/80 p-2 rounded">{data.summary}</p>
      )}

      {data.strategies?.map((s: any, i: number) => (
        <div key={i} className="bg-white/80 rounded p-3 space-y-1.5">
          <p className="text-xs font-semibold text-slate-700">{s.title}</p>
          <p className="text-xs text-slate-500">{s.description}</p>
          <ul className="space-y-0.5">
            {s.tactics?.map((t: string, j: number) => (
              <li key={j} className="text-xs text-slate-600">• {t}</li>
            ))}
          </ul>
        </div>
      ))}

      {data.differentiators?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">差异化优势</p>
          <div className="flex flex-wrap gap-1.5">
            {data.differentiators.map((d: string, i: number) => (
              <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{d}</span>
            ))}
          </div>
        </div>
      )}

      {data.risks?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">潜在风险</p>
          {data.risks.map((r: string, i: number) => (
            <p key={i} className="text-xs text-amber-700">⚠ {r}</p>
          ))}
        </div>
      )}
    </div>
  );
}
