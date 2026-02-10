'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataList } from '@/hooks/useData';
import { DataTable, Badge, SearchInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { PARTNER_STATUSES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { NewPartnerModal } from './_components/NewPartnerModal';
import type { Partner } from '@/types/partner';

const statusMap = Object.fromEntries(
  PARTNER_STATUSES.map((s) => [s.key, s])
);

const columns = [
  {
    key: 'name',
    title: '伙伴名称',
    render: (row: Partner) => (
      <span className="font-medium text-slate-800">{row.name}</span>
    ),
  },
  { key: 'region', title: '覆盖区域' },
  {
    key: 'cooperationMode',
    title: '合作模式',
    render: (row: Partner) => (
      <Badge variant={row.cooperationMode === 'direct_commission' ? 'blue' : 'purple'}>
        {row.cooperationMode === 'direct_commission' ? '直签佣金' : '转售折扣'}
      </Badge>
    ),
  },
  {
    key: 'status',
    title: '合作状态',
    render: (row: Partner) => {
      const s = statusMap[row.status];
      return (
        <Badge variant={s?.color as 'green' | 'yellow' | 'gray'}>
          {s?.label}
        </Badge>
      );
    },
  },
  { key: 'customerCount', title: '关联客户' },
  {
    key: 'conversionRate',
    title: '转化率',
    render: (row: Partner) => `${Math.round(row.conversionRate * 100)}%`,
  },
  {
    key: 'totalAmount',
    title: '本年商机金额',
    render: (row: Partner) => formatCurrency(row.totalAmount),
  },
];

export default function PartnersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const { data: partners, isLoading } = useDataList<Partner>('/api/partners');

  const filtered = partners.filter(
    (p) => p.name.includes(search) || p.region.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">生态合作伙伴</h2>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新建合作伙伴
        </Button>
      </div>

      <div className="glass-card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜索伙伴名称、覆盖区域..."
          className="max-w-sm mb-4"
        />
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/partners/${row.id}`)}
        />
      </div>

      <NewPartnerModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
