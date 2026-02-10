'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface ResourceData {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  category: string;
}

interface NewResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (resource: ResourceData) => void;
  editItem?: ResourceData | null;
}

const categoryOptions = [
  { value: '', label: '请选择分类' },
  { value: '产品介绍', label: '产品介绍' },
  { value: '解决方案', label: '解决方案' },
  { value: '技术文档', label: '技术文档' },
  { value: '竞品分析', label: '竞品分析' },
];

const typeOptions = [
  { value: '', label: '请选择类型' },
  { value: 'PDF', label: 'PDF' },
  { value: 'DOCX', label: 'DOCX' },
  { value: 'XLSX', label: 'XLSX' },
  { value: 'PPTX', label: 'PPTX' },
];

export function NewResourceModal({ open, onClose, onSave, editItem }: NewResourceModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setType(editItem.type);
      setSize(editItem.size);
    } else {
      setName(''); setCategory(''); setType(''); setSize('');
    }
  }, [editItem]);

  const handleSubmit = () => {
    if (!name.trim() || !category || !type) return;
    onSave({
      id: editItem?.id || `p-${Date.now()}`,
      name: name.trim(),
      type,
      size: size || '0MB',
      updatedAt: new Date().toISOString().slice(0, 10),
      category,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editItem ? '编辑产品资料' : '新建产品资料'}>
      <div className="space-y-4">
        <Input
          label="资料名称 *"
          placeholder="输入资料名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          label="分类 *"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="文件类型 *"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Input
            label="文件大小"
            placeholder="如 2.4MB"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </div>
    </Modal>
  );
}
