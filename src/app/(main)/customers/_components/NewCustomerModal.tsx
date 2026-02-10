'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CUSTOMER_TIERS, MINE_TYPES } from '@/lib/constants';

const tierOptions = [
  { value: '', label: '请选择客户层级' },
  ...CUSTOMER_TIERS.map((t) => ({ value: t.key, label: t.label })),
];

const mineOptions = [
  { value: '', label: '请选择矿种' },
  ...MINE_TYPES.map((m) => ({ value: m.key, label: m.label })),
];

const categoryOptions = [
  { value: '', label: '请选择客户分类' },
  { value: 'stable', label: '稳定客户' },
  { value: 'opportunity', label: '机会客户' },
  { value: 'new', label: '全新客户' },
];

interface NewCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewCustomerModal({ open, onClose }: NewCustomerModalProps) {
  const [form, setForm] = useState({
    name: '',
    mineType: '',
    group: '',
    region: '',
    tier: '',
    category: '',
    annualCapacity: '',
    contactPhone: '',
    contactEmail: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    // Mock: just close modal
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="新建客户" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="客户名称 *"
            placeholder="输入客户名称"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Select
            label="矿种 *"
            options={mineOptions}
            value={form.mineType}
            onChange={(e) => update('mineType', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="所属集团"
            placeholder="如：国家能源集团"
            value={form.group}
            onChange={(e) => update('group', e.target.value)}
          />
          <Input
            label="地区 *"
            placeholder="如：山西省"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="客户层级 *"
            options={tierOptions}
            value={form.tier}
            onChange={(e) => update('tier', e.target.value)}
          />
          <Select
            label="客户分类"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          />
        </div>

        <Input
          label="年产能"
          placeholder="如：500万吨/年"
          value={form.annualCapacity}
          onChange={(e) => update('annualCapacity', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="联系电话"
            placeholder="联系电话"
            value={form.contactPhone}
            onChange={(e) => update('contactPhone', e.target.value)}
          />
          <Input
            label="联系邮箱"
            placeholder="联系邮箱"
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>创建客户</Button>
        </div>
      </div>
    </Modal>
  );
}
