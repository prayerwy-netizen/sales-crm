'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataList } from '@/hooks/useData';
import type { Customer } from '@/types/customer';
import { DataTable, Badge, SearchInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { CUSTOMER_TIERS } from '@/lib/constants';
import { NewCustomerModal } from './_components/NewCustomerModal';

const tierMap = Object.fromEntries(
  CUSTOMER_TIERS.map((t) => [t.key, t])
);

const columns = [
  {
    key: 'name',
    title: '客户名称',
    render: (row: Customer) => (
      <span className="font-medium text-slate-800">{row.name}</span>
    ),
  },
  {
    key: 'mineType',
    title: '矿种',
    render: (row: Customer) => {
      const labels = { coal: '煤矿', metal: '金属矿', nonmetal: '非金属矿' };
      return labels[row.mineType];
    },
  },
  {
    key: 'tier',
    title: '客户层级',
    render: (row: Customer) => {
      const tier = tierMap[row.tier];
      return (
        <Badge variant={tier?.color as 'red' | 'orange' | 'blue'}>
          {tier?.label}
        </Badge>
      );
    },
  },
  { key: 'region', title: '地区' },
  {
    key: 'partnerName',
    title: '关联合作伙伴',
    render: (row: Customer) => row.partnerName || '-',
  },
  {
    key: 'opportunityCount',
    title: '商机数',
  },
  {
    key: 'lastContactDate',
    title: '活跃度',
    render: (row: Customer) => {
      if (!row.lastContactDate) return <span className="text-slate-300">-</span>;
      const days = Math.floor(
        (Date.now() - new Date(row.lastContactDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const dot = days > 60
        ? 'bg-red-500'
        : days > 30
        ? 'bg-amber-400'
        : 'bg-emerald-500';
      const label = days > 60 ? '沉默' : days > 30 ? '一般' : '活跃';
      return (
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
          <span className="text-xs text-slate-500">{label}</span>
          <span className="text-xs text-slate-400">{row.lastContactDate}</span>
        </div>
      );
    },
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const { data: customers, isLoading } = useDataList<Customer>('/api/customers');

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      c.region.includes(search) ||
      (c.group && c.group.includes(search))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">终端客户</h2>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新建客户
        </Button>
      </div>

      <div className="glass-card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜索客户名称、地区、集团..."
          className="max-w-sm mb-4"
        />
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/customers/${row.id}`)}
        />
      </div>

      <NewCustomerModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
