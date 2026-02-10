'use client';

import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Check, X, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface ParsedField {
  id: string;
  dimension: string;
  dimensionKey?: string;
  field: string;
  value: string;
  confirmed: boolean;
}

interface ParsedDataPreviewProps {
  fields: ParsedField[];
  onConfirmAll: (confirmedFields: ParsedField[]) => void;
  writing?: boolean;
}

export function ParsedDataPreview({ fields, onConfirmAll, writing }: ParsedDataPreviewProps) {
  const [items, setItems] = useState<ParsedField[]>(fields);

  useEffect(() => {
    setItems(fields);
  }, [fields]);

  const toggleConfirm = (id: string) => {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, confirmed: !f.confirmed } : f))
    );
  };

  const removeField = (id: string) => {
    setItems((prev) => prev.filter((f) => f.id !== id));
  };

  const updateValue = (id: string, value: string) => {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  const allConfirmed = items.length > 0 && items.every((f) => f.confirmed);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">
        AI 解析结果
      </h4>

      {items.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          onToggle={() => toggleConfirm(field.id)}
          onRemove={() => removeField(field.id)}
          onUpdateValue={(val) => updateValue(field.id, val)}
        />
      ))}

      {items.length > 0 && (
        <Button
          onClick={() => onConfirmAll(items.filter((f) => f.confirmed))}
          className="w-full"
          disabled={!allConfirmed || writing}
        >
          <Check className="h-4 w-4 mr-1" />
          {writing ? '写入中...' : '全部确认并写入'}
        </Button>
      )}

      {items.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">
          等待 AI 解析对话内容...
        </p>
      )}
    </div>
  );
}

function FieldCard({
  field,
  onToggle,
  onRemove,
  onUpdateValue,
}: {
  field: ParsedField;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateValue: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(field.value);

  const handleSave = () => {
    onUpdateValue(editVal);
    setEditing(false);
  };

  return (
    <GlassCard className="p-3">
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="text-[10px] text-primary font-medium">
            {field.dimension}
          </span>
          <p className="text-xs text-slate-500">{field.field}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditVal(field.value); setEditing(!editing); }}
            className="rounded p-1 bg-slate-50 text-slate-400 hover:text-primary transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggle}
            className={`rounded p-1 transition-colors ${
              field.confirmed
                ? 'bg-green-50 text-success'
                : 'bg-slate-50 text-slate-400 hover:text-success'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="rounded p-1 bg-slate-50 text-slate-400 hover:text-danger transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {editing ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button onClick={handleSave} className="rounded bg-primary px-2 py-1 text-xs text-white">
            保存
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-800 font-medium">
          {field.value}
        </p>
      )}
    </GlassCard>
  );
}
