'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlassCard, Badge, SearchInput } from '@/components/ui';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FileText, Briefcase, Download, Eye, Image, Plus, Trash2, Edit3 } from 'lucide-react';
import { NewResourceModal } from './_components/NewResourceModal';
import type { ResourceData } from './_components/NewResourceModal';
import { NewCaseModal } from './_components/NewCaseModal';
import type { CaseData } from './_components/NewCaseModal';

const tabs = [
  { key: 'products', label: '产品资料' },
  { key: 'cases', label: '案例库' },
  { key: 'materials', label: '营销素材' },
];

type MaterialItem = { id: string; name: string; type: string; format: string; updatedAt: string };

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');

  // Data from API
  const [products, setProducts] = useState<ResourceData[]>([]);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  // Modal states
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Edit states
  const [editProduct, setEditProduct] = useState<ResourceData | null>(null);
  const [editCase, setEditCase] = useState<CaseData | null>(null);
  const [editMaterial, setEditMaterial] = useState<MaterialItem | null>(null);

  // Fetch data from API
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch('/api/resources');
      const json = await res.json();
      const all = json.data || [];
      setProducts(all.filter((r: any) => r.resourceType === 'product').map((r: any) => ({
        id: r.id, name: r.name, type: r.fileType || '', size: r.fileSize || '',
        updatedAt: r.updatedAt || '', category: r.category || '',
      })));
      setCases(all.filter((r: any) => r.resourceType === 'case').map((r: any) => ({
        id: r.id, name: r.name, customer: r.customer || '', industry: r.industry || '',
        result: r.result || '', updatedAt: r.updatedAt || '',
      })));
      setMaterials(all.filter((r: any) => r.resourceType === 'material').map((r: any) => ({
        id: r.id, name: r.name, type: r.materialType || '', format: r.format || '',
        updatedAt: r.updatedAt || '',
      })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // Product CRUD
  const handleSaveProduct = async (item: ResourceData) => {
    const isEdit = !!editProduct;
    const body = { resourceType: 'product', name: item.name, fileType: item.type, fileSize: item.size, category: item.category };
    try {
      if (isEdit) {
        await fetch(`/api/resources/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      fetchResources();
    } catch { /* ignore */ }
    setEditProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  // Case CRUD
  const handleSaveCase = async (item: CaseData) => {
    const isEdit = !!editCase;
    const body = { resourceType: 'case', name: item.name, customer: item.customer, industry: item.industry, result: item.result };
    try {
      if (isEdit) {
        await fetch(`/api/resources/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      fetchResources();
    } catch { /* ignore */ }
    setEditCase(null);
  };

  const handleDeleteCase = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  };

  // Material CRUD
  const handleSaveMaterial = async (item: MaterialItem) => {
    const isEdit = !!editMaterial;
    const body = { resourceType: 'material', name: item.name, materialType: item.type, format: item.format };
    try {
      if (isEdit) {
        await fetch(`/api/resources/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      fetchResources();
    } catch { /* ignore */ }
    setEditMaterial(null);
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">产品资源库</h2>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4 mb-4">
          <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索资源..."
            className="max-w-xs ml-auto"
          />
          {activeTab === 'products' && (
            <Button size="sm" onClick={() => { setEditProduct(null); setShowResourceModal(true); }} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> 新建
            </Button>
          )}
          {activeTab === 'cases' && (
            <Button size="sm" onClick={() => { setEditCase(null); setShowCaseModal(true); }} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> 新建
            </Button>
          )}
          {activeTab === 'materials' && (
            <Button size="sm" onClick={() => { setEditMaterial(null); setShowMaterialModal(true); }} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> 新建
            </Button>
          )}
        </div>

        {activeTab === 'products' && (
          <ProductsList search={search} items={products} onDelete={handleDeleteProduct}
            onEdit={(item) => { setEditProduct(item); setShowResourceModal(true); }} />
        )}
        {activeTab === 'cases' && (
          <CasesList search={search} items={cases} onDelete={handleDeleteCase}
            onEdit={(item) => { setEditCase(item); setShowCaseModal(true); }} />
        )}
        {activeTab === 'materials' && (
          <MaterialsList search={search} items={materials} onDelete={handleDeleteMaterial}
            onEdit={(item) => { setEditMaterial(item); setShowMaterialModal(true); }} />
        )}
      </div>

      <NewResourceModal open={showResourceModal} onClose={() => setShowResourceModal(false)} onSave={handleSaveProduct} editItem={editProduct} />
      <NewCaseModal open={showCaseModal} onClose={() => setShowCaseModal(false)} onSave={handleSaveCase} editItem={editCase} />
      <NewMaterialModal open={showMaterialModal} onClose={() => setShowMaterialModal(false)} onSave={handleSaveMaterial} editItem={editMaterial} />
    </div>
  );
}

function ProductsList({ search, items, onDelete, onEdit }: {
  search: string; items: ResourceData[]; onDelete: (id: string) => void; onEdit: (item: ResourceData) => void;
}) {
  const filtered = items.filter(
    (p) => p.name.includes(search) || p.category.includes(search)
  );

  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{item.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <Badge variant="blue">{item.category}</Badge>
              <span className="text-xs text-slate-400">{item.type} · {item.size}</span>
              <span className="text-xs text-slate-400">{item.updatedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无匹配资料</p>
      )}
    </div>
  );
}

function CasesList({ search, items, onDelete, onEdit }: {
  search: string; items: CaseData[]; onDelete: (id: string) => void; onEdit: (item: CaseData) => void;
}) {
  const filtered = items.filter(
    (c) => c.name.includes(search) || c.customer.includes(search)
  );

  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{item.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-500">客户: {item.customer}</span>
              <Badge variant="green">{item.industry}</Badge>
              <span className="text-xs text-success font-medium">{item.result}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">{item.updatedAt}</span>
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无匹配案例</p>
      )}
    </div>
  );
}

function MaterialsList({ search, items, onDelete, onEdit }: {
  search: string; items: MaterialItem[]; onDelete: (id: string) => void; onEdit: (item: MaterialItem) => void;
}) {
  const filtered = items.filter(
    (m) => m.name.includes(search) || m.type.includes(search)
  );

  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
          <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Image className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{item.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <Badge variant="purple">{item.type}</Badge>
              <span className="text-xs text-slate-400">{item.format}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-primary transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无匹配素材</p>
      )}
    </div>
  );
}

function NewMaterialModal({ open, onClose, onSave, editItem }: {
  open: boolean;
  onClose: () => void;
  onSave: (item: MaterialItem) => void;
  editItem?: MaterialItem | null;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [format, setFormat] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setType(editItem.type);
      setFormat(editItem.format);
    } else {
      setName(''); setType(''); setFormat('');
    }
  }, [editItem]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: editItem?.id || `m-${Date.now()}`,
      name: name.trim(),
      type: type || '其他',
      format: format || '-',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editItem ? '编辑营销素材' : '新建营销素材'}>
      <div className="space-y-4">
        <Input
          label="素材名称 *"
          placeholder="输入素材名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="类型"
            placeholder="如：宣传册"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Input
            label="格式"
            placeholder="如：PDF"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
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
