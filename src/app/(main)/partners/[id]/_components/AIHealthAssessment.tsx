'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui';
import { Sparkles, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import type { Partner } from '@/types/partner';

interface Insight { type: 'warning' | 'positive'; content: string }
interface HealthData {
  healthScore: number;
  status: string;
  insights: Insight[];
}

interface AIHealthAssessmentProps {
  partner: Partner;
}

export function AIHealthAssessment({ partner }: AIHealthAssessmentProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/partner-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner }),
      });
      const json = await res.json();
      if (json.healthScore !== undefined) setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  }, [partner]);

  useEffect(() => {
    if (partner?.id) fetchHealth();
  }, [partner?.id, fetchHealth]);

  const score = data?.healthScore ?? '--';
  const isHealthy = (data?.healthScore ?? 0) >= 7;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI 健康度评估
        </h4>
        <button onClick={fetchHealth} disabled={loading} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
          isHealthy ? 'bg-green-50' : 'bg-orange-50'
        }`}>
          <span className={`text-xl font-bold ${
            isHealthy ? 'text-success' : 'text-warning'
          }`}>
            {score}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            {data?.status ?? '评估中'}
          </p>
          <p className="text-xs text-slate-400">综合健康度评分</p>
        </div>
      </div>

      <div className="space-y-2">
        {loading && !data && (
          <p className="text-xs text-slate-400 text-center py-2">AI 分析中...</p>
        )}
        {data?.insights.map((item, i) => (
          <InsightItem key={i} type={item.type} text={item.content} />
        ))}
      </div>
    </GlassCard>
  );
}

function InsightItem({ type, text }: { type: string; text: string }) {
  const isWarning = type === 'warning';
  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${isWarning ? 'bg-orange-50' : 'bg-green-50'}`}>
      {isWarning
        ? <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
        : <TrendingUp className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
      }
      <p className="text-xs text-slate-700">{text}</p>
    </div>
  );
}
