'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { Button } from '@/components/ui/Button';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';
import { Sparkles, TrendingUp, AlertTriangle, Target, RefreshCw } from 'lucide-react';

const tabs = [
  { key: 'overview', label: '总览' },
  { key: 'risks', label: '风险预警' },
  { key: 'recommendations', label: '策略建议' },
];

interface ReportData {
  overview: { healthScore: number; healthTrend: string; riskCount: number; expectedWinCount: number; summary: string };
  risks: { level: string; opportunity: string; description: string; suggestion: string }[];
  recommendations: { category: string; title: string; content: string; priority: string }[];
}

export default function AIReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunities }),
      });
      const data = await res.json();
      if (data.overview) setReport(data);
    } catch { /* ignore */ }
    setGenerating(false);
  }, [opportunities]);

  useEffect(() => {
    if (opportunities.length > 0 && !report) handleGenerate();
  }, [opportunities, report, handleGenerate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">AI 分析报告</h2>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              生成中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              重新生成
            </span>
          )}
        </Button>
      </div>

      <GlassCard>
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
        {activeTab === 'overview' && <OverviewSection data={report?.overview ?? null} />}
        {activeTab === 'risks' && <RisksSection risks={report?.risks ?? []} />}
        {activeTab === 'recommendations' && <RecommendationsSection items={report?.recommendations ?? []} />}
      </GlassCard>
    </div>
  );
}

function OverviewSection({ data }: { data: ReportData['overview'] | null }) {
  const score = data?.healthScore ?? '--';
  const trend = data?.healthTrend ?? '--';
  const riskCount = data?.riskCount ?? '--';
  const winCount = data?.expectedWinCount ?? '--';
  const summary = data?.summary ?? '暂无数据，请点击"重新生成"获取报告。';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">销售健康度</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{score}/100</p>
          <p className="text-xs text-slate-500 mt-1">{trend}</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium text-warning">风险商机</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{riskCount}</p>
          <p className="text-xs text-slate-500 mt-1">需要立即关注</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-success" />
            <span className="text-xs font-medium text-success">预计成交</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{winCount}</p>
          <p className="text-xs text-slate-500 mt-1">本季度预计赢单</p>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-slate-700 mb-3">AI 分析摘要</h5>
        <div className="p-4 rounded-lg bg-slate-50 space-y-3">
          {summary.split('\n').filter(Boolean).map((p, i) => (
            <p key={i} className="text-sm text-slate-700 leading-relaxed">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function RisksSection({ risks }: { risks: ReportData['risks'] }) {
  const levelConfig: Record<string, { label: string; variant: 'red' | 'orange' | 'yellow'; bg: string }> = {
    high: { label: '高风险', variant: 'red', bg: 'bg-red-50 border-red-100' },
    medium: { label: '中风险', variant: 'orange', bg: 'bg-orange-50 border-orange-100' },
    low: { label: '低风险', variant: 'yellow', bg: 'bg-yellow-50 border-yellow-100' },
  };

  if (risks.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">暂无风险数据，请点击"重新生成"获取报告。</p>;
  }

  return (
    <div className="space-y-3">
      {risks.map((risk, i) => {
        const config = levelConfig[risk.level] ?? levelConfig.low;
        return (
          <div key={i} className={`p-4 rounded-lg border ${config.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <Badge variant={config.variant}>{config.label}</Badge>
              <span className="text-sm font-medium text-slate-800">{risk.opportunity}</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
            <p className="text-sm text-primary">
              <span className="font-medium">建议：</span>{risk.suggestion}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function RecommendationsSection({ items }: { items: ReportData['recommendations'] }) {
  const priorityConfig: Record<string, { label: string; variant: 'red' | 'orange' | 'blue' }> = {
    high: { label: '紧急', variant: 'red' },
    medium: { label: '重要', variant: 'orange' },
    low: { label: '建议', variant: 'blue' },
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">暂无策略建议，请点击"重新生成"获取报告。</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((rec, i) => {
        const config = priorityConfig[rec.priority] ?? priorityConfig.low;
        return (
          <div
            key={i}
            className="p-4 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={config.variant}>{config.label}</Badge>
              <Badge variant="gray">{rec.category}</Badge>
              <span className="text-sm font-medium text-slate-800">
                {rec.title}
              </span>
            </div>
            <p className="text-sm text-slate-600">{rec.content}</p>
          </div>
        );
      })}
    </div>
  );
}