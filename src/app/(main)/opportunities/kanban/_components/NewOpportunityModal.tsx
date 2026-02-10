'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PRODUCT_LINES, SALES_PATHS, COMPETITION_MODES } from '@/lib/constants';

interface NewOpportunityModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewOpportunityModal({ open, onClose }: NewOpportunityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    customerName: '',
    productLine: 'full_solution',
    salesPath: 'direct_commission',
    expectedAmount: '',
    expectedCloseDate: '',
    competitionMode: 'competitive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: 仅关闭弹窗
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="新建商机" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="商机名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="请输入商机名称"
          required
        />
        <Input
          label="客户名称"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="请输入或选择客户"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="产品线"
            value={formData.productLine}
            onChange={(e) => setFormData({ ...formData, productLine: e.target.value })}
            options={PRODUCT_LINES.map((p) => ({ value: p.key, label: p.label }))}
          />
          <Select
            label="销售路径"
            value={formData.salesPath}
            onChange={(e) => setFormData({ ...formData, salesPath: e.target.value })}
            options={SALES_PATHS.map((s) => ({ value: s.key, label: s.label }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="预期金额（元）"
            type="number"
            value={formData.expectedAmount}
            onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
            placeholder="请输入预期金额"
          />
          <Input
            label="预计签约日期"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
        </div>
        <Select
          label="竞争模式"
          value={formData.competitionMode}
          onChange={(e) => setFormData({ ...formData, competitionMode: e.target.value })}
          options={COMPETITION_MODES.map((c) => ({ value: c.key, label: c.label }))}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">创建商机</Button>
        </div>
      </form>
    </Modal>
  );
}
