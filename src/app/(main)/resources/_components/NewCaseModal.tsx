'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface CaseData {
  id: string;
  name: string;
  customer: string;
  industry: string;
  result: string;
  updatedAt: string;
}

interface NewCaseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (caseItem: CaseData) => void;
  editItem?: CaseData | null;
}

const industryOptions = [
  { value: '', label: '请选择行业' },
  { value: '煤矿', label: '煤矿' },
  { value: '金属矿', label: '金属矿' },
  { value: '非金属矿', label: '非金属矿' },
  { value: '化工', label: '化工' },
];

export function NewCaseModal({ open, onClose, onSave, editItem }: NewCaseModalProps) {
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCustomer(editItem.customer);
      setIndustry(editItem.industry);
      setResult(editItem.result);
    } else {
      setName(''); setCustomer(''); setIndustry(''); setResult('');
    }
  }, [editItem]);

  const handleSubmit = () => {
    if (!name.trim() || !customer.trim()) return;
    onSave({
      id: editItem?.id || `c-${Date.now()}`,
      name: name.trim(),
      customer: customer.trim(),
      industry: industry || '其他',
      result: result || '-',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editItem ? '编辑案例' : '新建案例'}>
      <div className="space-y-4">
        <Input
          label="案例名称 *"
          placeholder="输入案例名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="客户名称 *"
          placeholder="输入客户名称"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <Select
          label="行业"
          options={industryOptions}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <Input
          label="成果"
          placeholder="如：效率提升35%"
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </div>
    </Modal>
  );
}
