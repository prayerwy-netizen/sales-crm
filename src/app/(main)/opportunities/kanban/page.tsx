'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { NewOpportunityModal } from './_components/NewOpportunityModal';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import Link from 'next/link';

const KanbanBoard = dynamic(
  () => import('./_components/KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false }
);

const AMOUNT_RANGES = [
  { value: '', label: '全部金额' },
  { value: '0-50', label: '50万以下' },
  { value: '50-200', label: '50-200万' },
  { value: '200-500', label: '200-500万' },
  { value: '500+', label: '500万以上' },
];

const PRODUCT_OPTIONS = [
  { value: '', label: '全部产品线' },
  { value: 'full_solution', label: '全案建设' },
  { value: 'saas', label: 'SaaS订阅' },
  { value: 'maas', label: 'MaaS服务' },
];

export default function KanbanPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  // 提取负责人列表
  const ownerOptions = useMemo(() => {
    const names = Array.from(new Set(opportunities.map((o) => o.ownerName).filter(Boolean)));
    return [{ value: '', label: '全部负责人' }, ...names.map((n) => ({ value: n, label: n }))];
  }, [opportunities]);

  // 筛选逻辑
  const activeOpps = useMemo(() => {
    return opportunities.filter((o) => {
      if (o.status !== 'active') return false;
      if (filterOwner && o.ownerName !== filterOwner) return false;
      if (filterProduct && o.productLine !== filterProduct) return false;
      if (filterAmount) {
        const amt = o.expectedAmount / 10000; // 转为万
        if (filterAmount === '0-50' && amt >= 50) return false;
        if (filterAmount === '50-200' && (amt < 50 || amt >= 200)) return false;
        if (filterAmount === '200-500' && (amt < 200 || amt >= 500)) return false;
        if (filterAmount === '500+' && amt < 500) return false;
      }
      return true;
    });
  }, [opportunities, filterOwner, filterProduct, filterAmount]);

  const hasFilters = !!(filterOwner || filterProduct || filterAmount);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">商机看板</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <span className="px-3 py-1.5 text-sm bg-primary text-white">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <Link
              href="/opportunities/list"
              className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
          <Button
            variant={hasFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            筛选{hasFilters ? ' ·' : ''}
          </Button>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            新建商机
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-slate-200">
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ownerOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {PRODUCT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filterAmount}
            onChange={(e) => setFilterAmount(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {AMOUNT_RANGES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setFilterOwner(''); setFilterProduct(''); setFilterAmount(''); }}
              className="text-xs text-slate-500 hover:text-primary transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      )}

      {/* Kanban */}
      <KanbanBoard initialOpportunities={activeOpps} />

      {/* Modal */}
      <NewOpportunityModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
      />
    </div>
  );
}
