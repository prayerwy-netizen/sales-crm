'use client';

import { useState } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { NewCommRecordModal } from '@/components/ui/NewCommRecordModal';
import { COMM_METHODS } from '@/lib/constants';
import type { CommunicationRecord } from '@/types/opportunity';
import { MessageSquare, Phone, Mail, Video, Users, Plus } from 'lucide-react';

interface CommunicationRecordsTabProps {
  records: CommunicationRecord[];
}

const methodIcons = {
  visit: Users,
  phone: Phone,
  wechat: MessageSquare,
  email: Mail,
  feishu: Video,
};

const methodMap = Object.fromEntries(
  COMM_METHODS.map((m) => [m.key, m.label])
);

export function CommunicationRecordsTab({ records: initialRecords }: CommunicationRecordsTabProps) {
  const [records, setRecords] = useState<CommunicationRecord[]>(initialRecords);
  const [showNew, setShowNew] = useState(false);

  const handleSave = (record: CommunicationRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">沟通记录</h4>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          新增记录
        </Button>
      </div>

      <div className="space-y-4">
        {records.map((record) => {
          const Icon = methodIcons[record.method];
          return (
            <div key={record.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="rounded-full p-2 bg-blue-50">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="w-px flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="blue">{methodMap[record.method]}</Badge>
                  <span className="text-xs text-slate-400">{record.createdAt}</span>
                  <span className="text-xs text-slate-400">by {record.createdBy}</span>
                </div>
                <p className="text-sm text-slate-700">{record.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  参与人: {record.participants.join('、')}
                </p>
                {record.nextFollowUp && (
                  <p className="text-xs text-primary mt-1">下次跟进: {record.nextFollowUp}</p>
                )}
              </div>
            </div>
          );
        })}
        {records.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">暂无沟通记录</p>
        )}
      </div>

      <NewCommRecordModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onSave={handleSave}
      />
    </GlassCard>
  );
}
