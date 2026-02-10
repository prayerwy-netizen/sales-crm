'use client';

import { GlassCard } from '@/components/ui';
import { Activity, MessageSquare, ArrowRightCircle, Plus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'communication' | 'stage_change' | 'new_opportunity';
  content: string;
  user: string;
  time: string;
}

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'communication', content: '拜访华电煤业集团安全部王处长', user: '王明', time: '2小时前' },
  { id: '2', type: 'stage_change', content: '陕煤集团SaaS项目推进至合同签订阶段', user: '李强', time: '5小时前' },
  { id: '3', type: 'communication', content: '与山东能源集团刘工微信沟通替换方案', user: '张伟', time: '昨天' },
  { id: '4', type: 'new_opportunity', content: '新建商机：中煤集团智能体全案', user: '王明', time: '昨天' },
  { id: '5', type: 'communication', content: '国家能源集团线上会议讨论MaaS部署', user: '王明', time: '2天前' },
];

const iconMap = {
  communication: <MessageSquare className="h-3.5 w-3.5" />,
  stage_change: <ArrowRightCircle className="h-3.5 w-3.5" />,
  new_opportunity: <Plus className="h-3.5 w-3.5" />,
};

const colorMap = {
  communication: 'bg-blue-100 text-blue-600',
  stage_change: 'bg-green-100 text-green-600',
  new_opportunity: 'bg-orange-100 text-orange-600',
};

export function ActivityTimeline() {
  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          近期动态
        </h3>
      </div>
      <div className="space-y-3">
        {mockActivities.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`rounded-full p-1.5 shrink-0 ${colorMap[item.type]}`}>
              {iconMap[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{item.content}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {item.user} · {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
