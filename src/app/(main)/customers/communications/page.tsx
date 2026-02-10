'use client';

import { useState, useMemo } from 'react';
import { GlassCard, Badge, SearchInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { NewCommRecordModal } from '@/components/ui/NewCommRecordModal';
import { useDataList } from '@/hooks/useData';
import { COMM_METHODS } from '@/lib/constants';
import type { CommunicationRecord } from '@/types/opportunity';
import {
  MessageSquare,
  Plus,
  Phone,
  Mail,
  Users,
  Video,
  MapPin,
} from 'lucide-react';

const methodIcons: Record<string, React.ReactNode> = {
  visit: <MapPin className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  wechat: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  feishu: <Video className="h-4 w-4" />,
};

const methodColors: Record<string, string> = {
  visit: 'bg-blue-50 text-blue-600',
  phone: 'bg-green-50 text-green-600',
  wechat: 'bg-emerald-50 text-emerald-600',
  email: 'bg-purple-50 text-purple-600',
  feishu: 'bg-indigo-50 text-indigo-600',
};

const methodFilterOptions = [
  { value: '', label: '全部方式' },
  ...COMM_METHODS.map((m) => ({ value: m.key, label: m.label })),
];

const entityFilterOptions = [
  { value: '', label: '全部类型' },
  { value: 'customer', label: '客户' },
  { value: 'partner', label: '合作伙伴' },
];

export default function CommunicationsPage() {
  const { data: initialRecords } = useDataList<CommunicationRecord>('/api/communications');
  const [localRecords, setLocalRecords] = useState<CommunicationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const records = [...localRecords, ...initialRecords];

  const filtered = useMemo(() => {
    return records
      .filter((r) => {
        if (search && !r.content.includes(search) && !r.entityName.includes(search)) return false;
        if (methodFilter && r.method !== methodFilter) return false;
        if (entityFilter && r.entityType !== entityFilter) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, search, methodFilter, entityFilter]);

  const handleSave = (record: CommunicationRecord) => {
    setLocalRecords((prev) => [record, ...prev]);
  };

  const methodLabel = (key: string) =>
    COMM_METHODS.find((m) => m.key === key)?.label ?? key;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">沟通记录</h2>
        <Button onClick={() => setShowModal(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          新增记录
        </Button>
      </div>

      {/* 筛选栏 */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索沟通内容或客户名称..."
            className="max-w-xs"
          />
          <Select
            options={methodFilterOptions}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          />
          <Select
            options={entityFilterOptions}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
          <span className="ml-auto text-xs text-slate-400">
            共 {filtered.length} 条记录
          </span>
        </div>
      </GlassCard>

      {/* 时间线列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">暂无沟通记录</p>
          </GlassCard>
        ) : (
          filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              methodLabel={methodLabel}
            />
          ))
        )}
      </div>

      <NewCommRecordModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}

function RecordCard({
  record,
  methodLabel,
}: {
  record: CommunicationRecord;
  methodLabel: (key: string) => string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex gap-3">
        {/* 左侧图标 */}
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            methodColors[record.method] || 'bg-slate-50 text-slate-500'
          }`}
        >
          {methodIcons[record.method] || (
            <MessageSquare className="h-4 w-4" />
          )}
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* 头部信息 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-800">
              {record.entityName}
            </span>
            <Badge
              variant={
                record.entityType === 'customer' ? 'blue' : 'purple'
              }
            >
              {record.entityType === 'customer' ? '客户' : '合作伙伴'}
            </Badge>
            <Badge variant="green">{methodLabel(record.method)}</Badge>
            <span className="text-xs text-slate-400 ml-auto shrink-0">
              {record.createdAt}
            </span>
          </div>

          {/* 沟通内容 */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {record.content}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {record.participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {record.participants.join('、')}
              </span>
            )}
            {record.nextFollowUp && (
              <span>下次跟进: {record.nextFollowUp}</span>
            )}
            <span>记录人: {record.createdBy}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
