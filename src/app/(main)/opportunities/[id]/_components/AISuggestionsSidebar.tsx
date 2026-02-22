'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui';
import { Sparkles, AlertTriangle, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity';
import { SALES_PLAYBOOK } from '@/lib/salesPlaybook';

interface Suggestion {
  type: 'risk' | 'tip' | 'next';
  content: string;
}

interface AISuggestionsSidebarProps {
  opportunity: Opportunity;
  fetchRef?: React.MutableRefObject<(() => void) | null>;
}

const iconMap = {
  risk: { Icon: AlertTriangle, bg: 'bg-red-50 border-red-100', color: 'text-danger' },
  tip: { Icon: Lightbulb, bg: 'bg-blue-50 border-blue-100', color: 'text-primary' },
  next: { Icon: ArrowRight, bg: 'bg-blue-50 border-blue-100', color: 'text-primary' },
};

function FormulaTooltip({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  const formula = SALES_PLAYBOOK.find(
    (f) => f.name === name || f.name.includes(name) || name.includes(f.name),
  );
  if (!formula) return <span>【{name}】</span>;

  return (
    <span className="relative inline-block">
      <span
        className="text-primary font-medium cursor-help border-b border-dashed border-primary/50"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        【{name}】
      </span>
      {show && (
        <div className="absolute bottom-full right-0 mb-1.5 z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl text-xs">
          <p className="font-semibold text-slate-800 mb-1">{formula.name}</p>
          <p className="font-mono text-[10px] text-primary bg-blue-50 rounded px-1.5 py-1 mb-2 leading-relaxed">{formula.formula}</p>
          <p className="text-slate-600 mb-2">{formula.summary}</p>
          {formula.judgmentRules.filter(r => r.level !== 'good').slice(0, 2).map((r, i) => (
            <p key={i} className="text-slate-500 leading-relaxed">⚠ {r.assessment}</p>
          ))}
        </div>
      )}
    </span>
  );
}

function renderContent(text: string) {
  return text.split(/(【[^】]+】)/).map((part, i) => {
    const match = part.match(/^【([^】]+)】$/);
    return match ? <FormulaTooltip key={i} name={match[1]} /> : <span key={i}>{part}</span>;
  });
}

export function AISuggestionsSidebar({ opportunity, fetchRef }: AISuggestionsSidebarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // 拉取维度评分，供方法论规则匹配使用
      const dimRes = await fetch(`/api/opportunities/${opportunity.id}/dimensions`);
      const dimJson = await dimRes.json();
      const dimensionScores: Record<string, number> = {};
      for (const r of (dimJson.data || [])) {
        dimensionScores[r.dimension_key] = r.scores?.contentScore ?? 0;
      }

      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity: { ...opportunity, dimensionScores } }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch { /* ignore */ }
    setLoading(false);
  }, [opportunity]);

  useEffect(() => {
    if (opportunity?.id) fetchSuggestions();
  }, [opportunity?.id, fetchSuggestions]);

  useEffect(() => {
    if (fetchRef) fetchRef.current = fetchSuggestions;
  }, [fetchRef, fetchSuggestions]);

  return (
    <div className="space-y-4">
      {/* AI 建议 */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 赢单建议
          </h4>
          <button onClick={fetchSuggestions} disabled={loading} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="space-y-2.5">
          {loading && suggestions.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">AI 分析中...</p>
          )}
          {suggestions.map((s, i) => {
            const cfg = iconMap[s.type] ?? iconMap.tip;
            return (
              <div key={i} className={`p-2.5 rounded-lg border ${cfg.bg}`}>
                <div className="flex items-start gap-2">
                  <cfg.Icon className={`h-3.5 w-3.5 ${cfg.color} mt-0.5 shrink-0`} />
                  <p className="text-xs text-slate-700 leading-relaxed">{renderContent(s.content)}</p>
                </div>
              </div>
            );
          })}
          {!loading && suggestions.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">暂无建议</p>
          )}
        </div>
      </GlassCard>

      {/* 关联客户 */}
      <GlassCard>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">关联客户</h4>
        <div className="text-sm">
          <p className="text-slate-700 font-medium">{opportunity.customerName}</p>
          <p className="text-xs text-slate-400 mt-1">
            赢单率: {Math.round(opportunity.winRate * 100)}%
          </p>
        </div>
      </GlassCard>

      {/* 关联合作伙伴 */}
      {opportunity.partnerName && (
        <GlassCard>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">关联合作伙伴</h4>
          <p className="text-sm text-slate-700">{opportunity.partnerName}</p>
        </GlassCard>
      )}
    </div>
  );
}
