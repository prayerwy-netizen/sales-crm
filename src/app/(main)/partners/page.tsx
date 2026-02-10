'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDataList } from '@/hooks/useData';
import { DataTable, Badge, SearchInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Trophy } from 'lucide-react';
import { PARTNER_STATUSES } from '@/lib/constants';
import { formatCurrency, cn } from '@/lib/utils';
import { NewPartnerModal } from './_components/NewPartnerModal';
import type { Partner } from '@/types/partner';

type SortField = 'totalAmount' | 'conversionRate';

const statusMap = Object.fromEntries(
  PARTNER_STATUSES.map((s) => [s.key, s])
);

function buildColumns(ranked: (Partner & { _rank: number })[]) {
  return [
    {
      key: '_rank',
      title: '#',
      render: (row: Partner & { _rank: number }) => {
        const medal = row._rank === 1 ? 'text-amber-500' : row._rank === 2 ? 'text-slate-400' : row._rank === 3 ? 'text-amber-700' : '';
        return row._rank <= 3
          ? <Trophy className={cn('h-4 w-4', medal)} />
          : <span className="text-xs text-slate-400">{row._rank}</span>;
      },
    },
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
}

export default function PartnersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('totalAmount');
  const { data: partners } = useDataList<Partner>('/api/partners');

  const ranked = useMemo(() => {
    const filtered = partners.filter(
      (p) => p.name.includes(search) || p.region.includes(search)
    );
    const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);
    return sorted.map((p, i) => ({ ...p, _rank: i + 1 }));
  }, [partners, search, sortBy]);

  const columns = useMemo(() => buildColumns(ranked), [ranked]);

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
        <div className="flex items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索伙伴名称、覆盖区域..."
            className="max-w-sm"
          />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>排名依据：</span>
            <button
              onClick={() => setSortBy('totalAmount')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors',
                sortBy === 'totalAmount' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-100'
              )}
            >
              商机金额
            </button>
            <button
              onClick={() => setSortBy('conversionRate')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors',
                sortBy === 'conversionRate' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-100'
              )}
            >
              转化率
            </button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={ranked}
          onRowClick={(row) => router.push(`/partners/${row.id}`)}
        />
      </div>

      <NewPartnerModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
