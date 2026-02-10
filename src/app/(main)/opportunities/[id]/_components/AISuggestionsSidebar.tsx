'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui';
import { Sparkles, AlertTriangle, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity';

interface Suggestion {
  type: 'risk' | 'tip' | 'next';
  content: string;
}

interface AISuggestionsSidebarProps {
  opportunity: Opportunity;
}

const iconMap = {
  risk: { Icon: AlertTriangle, bg: 'bg-red-50 border-red-100', color: 'text-danger' },
  tip: { Icon: Lightbulb, bg: 'bg-blue-50 border-blue-100', color: 'text-primary' },
  next: { Icon: ArrowRight, bg: 'bg-blue-50 border-blue-100', color: 'text-primary' },
};

export function AISuggestionsSidebar({ opportunity }: AISuggestionsSidebarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch { /* ignore */ }
    setLoading(false);
  }, [opportunity]);

  useEffect(() => {
    if (opportunity?.id) fetchSuggestions();
  }, [opportunity?.id, fetchSuggestions]);

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
                  <p className="text-xs text-slate-700">{s.content}</p>
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
