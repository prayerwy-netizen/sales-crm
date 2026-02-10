'use client';

import { useState } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CheckCircle2, Circle, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import type { ActionPlan } from '@/types/opportunity';

interface ActionPlansTabProps {
  plans: ActionPlan[];
}

const statusConfig = {
  pending: { label: '未完成', variant: 'gray' as const, icon: Circle },
  in_progress: { label: '进行中', variant: 'blue' as const, icon: Clock },
  completed: { label: '已完成', variant: 'green' as const, icon: CheckCircle2 },
};

const nextStatus: Record<string, ActionPlan['status']> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export function ActionPlansTab({ plans: initialPlans }: ActionPlansTabProps) {
  const [plans, setPlans] = useState<ActionPlan[]>(initialPlans);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);

  const toggleStatus = (id: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: nextStatus[p.status] } : p
      )
    );
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = (plan: ActionPlan) => {
    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    } else {
      setPlans((prev) => [...prev, plan]);
    }
    setShowForm(false);
    setEditingPlan(null);
  };

  const openEdit = (plan: ActionPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const openNew = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">行动计划</h4>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          新增计划
        </Button>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => {
          const config = statusConfig[plan.status];
          const Icon = config.icon;
          return (
            <div
              key={plan.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors group"
            >
              <button
                onClick={() => toggleStatus(plan.id)}
                className="mt-0.5 shrink-0"
                title="切换状态"
              >
                <Icon className="h-4 w-4 text-slate-400 hover:text-primary transition-colors" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{plan.content}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">执行人: {plan.executor}</span>
                  <span className="text-xs text-slate-400">截止: {plan.plannedDate}</span>
                  {plan.measureResult && (
                    <span className="text-xs text-slate-400">结果: {plan.measureResult}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.variant}>{config.label}</Badge>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => openEdit(plan)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {plans.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">暂无行动计划</p>
        )}
      </div>

      <PlanFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingPlan(null); }}
        onSave={handleSave}
        initial={editingPlan}
      />
    </GlassCard>
  );
}

function PlanFormModal({
  open, onClose, onSave, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (plan: ActionPlan) => void;
  initial: ActionPlan | null;
}) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [executor, setExecutor] = useState(initial?.executor ?? '');
  const [plannedDate, setPlannedDate] = useState(initial?.plannedDate ?? '');
  const [measureResult, setMeasureResult] = useState(initial?.measureResult ?? '');

  // Reset form when modal opens with new data
  const isEdit = !!initial;

  const handleSubmit = () => {
    const plan: ActionPlan = {
      id: initial?.id ?? `plan-${Date.now()}`,
      opportunityId: initial?.opportunityId ?? '',
      content,
      executor,
      plannedDate,
      measureResult: measureResult || undefined,
      status: initial?.status ?? 'pending',
    };
    onSave(plan);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '编辑行动计划' : '新增行动计划'}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">行动内容 *</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="描述具体行动内容..."
            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="执行人 *"
            placeholder="负责人姓名"
            value={executor}
            onChange={(e) => setExecutor(e.target.value)}
          />
          <Input
            label="计划日期 *"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
          />
        </div>
        <Input
          label="衡量结果"
          placeholder="如何衡量该行动的完成效果"
          value={measureResult}
          onChange={(e) => setMeasureResult(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>{isEdit ? '保存修改' : '创建计划'}</Button>
        </div>
      </div>
    </Modal>
  );
}
