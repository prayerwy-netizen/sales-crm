'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { COMM_METHODS } from '@/lib/constants';
import type { CommunicationRecord } from '@/types/opportunity';

const methodOptions = [
  { value: '', label: '请选择沟通方式' },
  ...COMM_METHODS.map((m) => ({ value: m.key, label: m.label })),
];

interface NewCommRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: CommunicationRecord) => void;
  entityType?: 'customer' | 'partner';
  entityId?: string;
  entityName?: string;
}

export function NewCommRecordModal({
  open, onClose, onSave, entityType = 'customer', entityId = '', entityName = '',
}: NewCommRecordModalProps) {
  const [method, setMethod] = useState('');
  const [content, setContent] = useState('');
  const [participants, setParticipants] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const handleSubmit = () => {
    const record: CommunicationRecord = {
      id: `comm-${Date.now()}`,
      entityType,
      entityId,
      entityName,
      method: method as CommunicationRecord['method'],
      content,
      participants: participants.split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
      nextFollowUp: nextFollowUp || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: '当前用户',
    };
    onSave(record);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setMethod('');
    setContent('');
    setParticipants('');
    setNextFollowUp('');
  };

  return (
    <Modal open={open} onClose={onClose} title="新增沟通记录">
      <div className="space-y-4">
        <Select
          label="沟通方式 *"
          options={methodOptions}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">沟通内容 *</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="描述本次沟通的主要内容、关键信息、达成共识..."
            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <Input
          label="参与人"
          placeholder="多人用逗号分隔，如：张三、李四、王五"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
        />

        <Input
          label="下次跟进计划"
          placeholder="下次跟进的时间和内容"
          value={nextFollowUp}
          onChange={(e) => setNextFollowUp(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存记录</Button>
        </div>
      </div>
    </Modal>
  );
}
