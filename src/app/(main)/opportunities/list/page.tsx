'use client';

import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';
import { DataTable, Badge, SearchInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Plus, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const stageMap = Object.fromEntries(STAGES.map((s) => [s.key, s]));

const columns = [
  {
    key: 'name',
    title: '商机名称',
    render: (row: Opportunity) => (
      <span className="font-medium text-slate-800">{row.name}</span>
    ),
  },
  { key: 'customerName', title: '客户' },
  {
    key: 'stage',
    title: '阶段',
    render: (row: Opportunity) => (
      <Badge variant="blue">{stageMap[row.stage]?.label}</Badge>
    ),
  },
  {
    key: 'expectedAmount',
    title: '预期金额',
    render: (row: Opportunity) => formatCurrency(row.expectedAmount),
  },
  { key: 'ownerName', title: '负责人' },
  {
    key: 'winRate',
    title: '赢单率',
    render: (row: Opportunity) => (
      <span className="font-medium">{Math.round(row.winRate * 100)}%</span>
    ),
  },
  { key: 'updatedAt', title: '更新时间' },
];

export default function OpportunityListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: opportunities, isLoading } = useDataList<Opportunity>('/api/opportunities');

  const filtered = opportunities.filter(
    (o) =>
      o.name.includes(search) ||
      o.customerName.includes(search) ||
      o.ownerName.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">商机列表</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <Link
              href="/opportunities/kanban"
              className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <span className="px-3 py-1.5 text-sm bg-primary text-white">
              <List className="h-4 w-4" />
            </span>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            新建商机
          </Button>
        </div>
      </div>

      <div className="glass-card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜索商机名称、客户、负责人..."
          className="max-w-sm mb-4"
        />
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/opportunities/${row.id}`)}
        />
      </div>
    </div>
  );
}
