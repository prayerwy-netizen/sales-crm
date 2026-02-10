'use client';

import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ActionPlanItem {
  id: string;
  content: string;
  executor: string;
  plannedDate: string;
  measureResult: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DimensionContext {
  dimensionKey: string;
  dimensionLabel: string;
  formData: Record<string, unknown>;
}

interface ActionPlanTableProps {
  items: ActionPlanItem[];
  onChange: (items: ActionPlanItem[]) => void;
  onRequestAI?: () => void;
  aiLoading?: boolean;
  dimensionContext?: DimensionContext;
}

const statusOptions = [
  { value: 'pending', label: '未开始', color: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
];

let nextId = 1;

export function ActionPlanTable({ items, onChange, onRequestAI, aiLoading, dimensionContext }: ActionPlanTableProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: `ap-${Date.now()}-${nextId++}`,
        content: '',
        executor: '',
        plannedDate: '',
        measureResult: '',
        status: 'pending',
      },
    ]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ActionPlanItem, value: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          重点行动计划
        </label>
        <div className="flex items-center gap-2">
          {onRequestAI && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestAI}
              disabled={aiLoading}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {aiLoading ? 'AI生成中...' : 'AI推荐'}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            添加
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="text-xs text-slate-400">暂无行动计划，点击"添加"或"AI推荐"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <ActionPlanRow
              key={item.id}
              index={idx}
              item={item}
              onUpdate={(field, value) => updateItem(item.id, field, value)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionPlanRow({
  index,
  item,
  onUpdate,
  onRemove,
}: {
  index: number;
  item: ActionPlanItem;
  onUpdate: (field: keyof ActionPlanItem, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="shrink-0 text-xs font-medium text-slate-400 mt-1">#{index + 1}</span>
        <textarea
          rows={2}
          value={item.content}
          onChange={(e) => onUpdate('content', e.target.value)}
          placeholder="行动内容..."
          className="flex-1 rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1 text-slate-400 hover:text-danger transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <input
          type="text"
          value={item.executor}
          onChange={(e) => onUpdate('executor', e.target.value)}
          placeholder="执行人"
          className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="date"
          value={item.plannedDate}
          onChange={(e) => onUpdate('plannedDate', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          value={item.measureResult}
          onChange={(e) => onUpdate('measureResult', e.target.value)}
          placeholder="衡量结果"
          className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={item.status}
          onChange={(e) => onUpdate('status', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
