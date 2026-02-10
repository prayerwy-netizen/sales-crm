'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { StageProgressBar } from './_components/StageProgressBar';
import { BasicInfoTab } from './_components/BasicInfoTab';
import { EvaluationDimensionsTab } from './_components/EvaluationDimensionsTab';
import { EvaluationSummaryTab } from './_components/EvaluationSummaryTab';
import { ActionPlansTab } from './_components/ActionPlansTab';
import { CommunicationRecordsTab } from './_components/CommunicationRecordsTab';
import { AISuggestionsSidebar } from './_components/AISuggestionsSidebar';
import { useDataItem, useDataList } from '@/hooks/useData';
import type { Opportunity, CommunicationRecord, DimensionScore } from '@/types/opportunity';
import { Modal } from '@/components/ui/Modal';
import { STAGES, DIMENSIONS } from '@/lib/constants';
import type { StageKey } from '@/lib/constants';
import { getRequiredDimensions } from '@/lib/parameterConfig';
import { ArrowLeft, Bot, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';

const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'dimensions', label: '评估维度' },
  { key: 'summary', label: '评估总表' },
  { key: 'actions', label: '行动计划' },
  { key: 'communications', label: '沟通记录' },
];

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [showValidation, setShowValidation] = useState(false);
  const [missingDims, setMissingDims] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<StageKey>('lead');

  const id = params.id as string;
  const { data: opportunity, refetch: refetchOpp } = useDataItem<Opportunity>(`/api/opportunities/${id}`);
  const { data: records } = useDataList<CommunicationRecord>(`/api/communications?opportunityId=${id}`);

  // 从 API 加载维度数据
  const [dimRecords, setDimRecords] = useState<Record<string, unknown>[]>([]);
  const fetchDimensions = useCallback(async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}/dimensions`);
      const json = await res.json();
      setDimRecords(json.data || []);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => { fetchDimensions(); }, [fetchDimensions]);

  // 赢单率动态计算：维度数据变化时自动回写（基于参数配置匹配维度）
  useEffect(() => {
    if (!opportunity || dimRecords.length === 0) return;
    const requiredKeys = getRequiredDimensions(
      opportunity.productLine,
      opportunity.expectedAmount,
      currentStage
    );
    const activeDims = DIMENSIONS.filter((d) => requiredKeys.includes(d.key as any));
    if (activeDims.length === 0) return;
    const filledMap = new Map(dimRecords.map((r: any) => [r.dimension_key, r]));
    const weightedSum = activeDims.reduce((sum, d) => {
      const rec = filledMap.get(d.key);
      return sum + (rec?.scores?.contentScore ?? 0);
    }, 0);
    const avg = weightedSum / activeDims.length;
    const newWinRate = Math.min(Math.round(avg * 10), 100) / 100;
    // 仅当变化超过 1% 时回写
    if (Math.abs(newWinRate - opportunity.winRate) >= 0.01) {
      fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winRate: newWinRate }),
      }).catch(() => {});
    }
  }, [dimRecords, opportunity, currentStage, id]);

  useEffect(() => {
    if (opportunity) {
      setCurrentStage(opportunity.stage);
    }
  }, [opportunity]);

  if (!opportunity) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  // 从维度记录中提取得分（用于评估总表和校验）
  const scores: DimensionScore[] = dimRecords.map((r: any) => ({
    dimensionKey: r.dimension_key,
    contentScore: r.scores?.contentScore ?? 0,
    selfScore: r.scores?.selfScore ?? 0,
    reviewScore: r.scores?.reviewScore ?? 0,
  }));

  // 从维度记录中提取行动计划
  const plans = dimRecords.flatMap((r: any) => {
    const items = r.data?.actionPlans || [];
    return items.map((p: any, idx: number) => ({
      id: `${r.dimension_key}-${idx}`,
      opportunityId: id,
      dimensionKey: r.dimension_key,
      content: p.content || '',
      executor: p.executor || '',
      plannedDate: p.plannedDate || '',
      measureResult: p.measureResult || '',
      status: p.status || 'pending',
    }));
  });

  const stageIndex = STAGES.findIndex((s) => s.key === currentStage);
  const isLastStage = stageIndex >= STAGES.length - 1;

  const handleAdvanceStage = async () => {
    if (isLastStage) return;

    // 校验当前阶段必填维度是否已填写（基于参数配置自动匹配）
    const requiredKeys = getRequiredDimensions(
      opportunity.productLine,
      opportunity.expectedAmount,
      currentStage
    );
    const requiredDims = DIMENSIONS.filter((d) => requiredKeys.includes(d.key as any));
    const filledKeys = new Set(dimRecords.map((r: any) => r.dimension_key));
    const missing = requiredDims.filter((d) => !filledKeys.has(d.key));

    if (missing.length > 0) {
      setMissingDims(missing.map((d) => d.label));
      setShowValidation(true);
      return;
    }

    // 推进阶段并持久化
    const nextStage = STAGES[stageIndex + 1].key;
    try {
      await fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
      setCurrentStage(nextStage);
      refetchOpp();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">
            {opportunity.name}
          </h2>
          <div className="mt-2 max-w-xl">
            <StageProgressBar currentStage={currentStage} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bot className="h-4 w-4 mr-1" />
            AI录入
          </Button>
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-1" />
            AI建议
          </Button>
          <Button size="sm" onClick={handleAdvanceStage} disabled={isLastStage}>
            {isLastStage ? '已完成' : '推进阶段'}
            {!isLastStage && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Left main */}
        <div className="flex-1 min-w-0">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-4"
          />
          {activeTab === 'basic' && (
            <BasicInfoTab opportunity={opportunity} />
          )}
          {activeTab === 'dimensions' && (
            <EvaluationDimensionsTab
              currentStage={currentStage}
              scores={scores}
              opportunityId={id}
              productLine={opportunity.productLine}
              expectedAmount={opportunity.expectedAmount}
            />
          )}
          {activeTab === 'summary' && (
            <EvaluationSummaryTab
              currentStage={currentStage}
              scores={scores}
              opportunityId={id}
            />
          )}
          {activeTab === 'actions' && (
            <ActionPlansTab plans={plans} />
          )}
          {activeTab === 'communications' && (
            <CommunicationRecordsTab records={records} />
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0">
          <AISuggestionsSidebar opportunity={opportunity} />
        </div>
      </div>
      {/* Stage validation modal */}
      <Modal open={showValidation} onClose={() => setShowValidation(false)} title="无法推进阶段">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">以下维度尚未完成评估：</p>
              <ul className="mt-2 space-y-1">
                {missingDims.map((dim) => (
                  <li key={dim} className="text-sm text-slate-600">• {dim}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-500">请先完成当前阶段所有必填维度的评估，再推进到下一阶段。</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowValidation(false)}>知道了</Button>
            <Button onClick={() => { setShowValidation(false); setActiveTab('dimensions'); }}>
              去填写
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
