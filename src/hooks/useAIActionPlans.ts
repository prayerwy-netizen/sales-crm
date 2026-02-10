'use client';

import { useState, useCallback } from 'react';
import type { ActionPlanItem } from '@/app/(main)/opportunities/[id]/_components/dimensions/shared/ActionPlanTable';

interface UseAIActionPlansOptions {
  dimensionKey: string;
  dimensionLabel: string;
  getFormData: () => Record<string, unknown>;
  actionPlans: ActionPlanItem[];
  setActionPlans: (plans: ActionPlanItem[]) => void;
}

export function useAIActionPlans({
  dimensionKey,
  dimensionLabel,
  getFormData,
  actionPlans,
  setActionPlans,
}: UseAIActionPlansOptions) {
  const [aiLoading, setAiLoading] = useState(false);

  const requestAI = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/action-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensionKey,
          dimensionLabel,
          formData: getFormData(),
        }),
      });

      if (!res.ok) throw new Error('请求失败');

      const data = await res.json();
      const newPlans: ActionPlanItem[] = (data.plans || []).map(
        (p: { content: string; executor: string; plannedDate: string; measureResult: string }, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          content: p.content || '',
          executor: p.executor || '',
          plannedDate: p.plannedDate || '',
          measureResult: p.measureResult || '',
          status: 'pending' as const,
        })
      );

      setActionPlans([...actionPlans, ...newPlans]);
    } catch {
      // 静默失败，用户可重试
    } finally {
      setAiLoading(false);
    }
  }, [dimensionKey, dimensionLabel, getFormData, actionPlans, setActionPlans]);

  return { aiLoading, requestAI };
}
