'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const modeOptions = [
  { value: '', label: '请选择合作模式' },
  { value: 'direct_commission', label: '直签佣金制' },
  { value: 'resale_discount', label: '转售折扣制' },
];

const statusOptions = [
  { value: 'active', label: '活跃' },
  { value: 'observing', label: '观察' },
  { value: 'paused', label: '暂停' },
];

interface NewPartnerModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewPartnerModal({ open, onClose }: NewPartnerModalProps) {
  const [form, setForm] = useState({
    name: '',
    region: '',
    cooperationMode: '',
    status: 'active',
    startDate: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    profitShareRatio: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="新建合作伙伴" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="伙伴名称 *"
            placeholder="输入合作伙伴名称"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            label="覆盖区域 *"
            placeholder="如：山西省、内蒙古"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="合作模式 *"
            options={modeOptions}
            value={form.cooperationMode}
            onChange={(e) => update('cooperationMode', e.target.value)}
          />
          <Select
            label="合作状态"
            options={statusOptions}
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="合作开始日期"
            type="date"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
          />
          <Input
            label="利润分成比例(%)"
            type="number"
            min={0}
            max={100}
            placeholder="如：30"
            value={form.profitShareRatio}
            onChange={(e) => update('profitShareRatio', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="联系人"
            placeholder="联系人姓名"
            value={form.contactName}
            onChange={(e) => update('contactName', e.target.value)}
          />
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
          <Button onClick={handleSubmit}>创建伙伴</Button>
        </div>
      </div>
    </Modal>
  );
}
