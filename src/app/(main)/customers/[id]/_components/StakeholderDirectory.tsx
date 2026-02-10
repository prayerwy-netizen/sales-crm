'use client';

import { GlassCard, Badge } from '@/components/ui';
import { STAKEHOLDER_ROLES } from '@/types/customer';
import type { Stakeholder } from '@/types/customer';
import { User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StakeholderDirectoryProps {
  stakeholders: Stakeholder[];
}

const roleColors: Record<string, 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray'> = {
  decision_maker: 'red',
  key_buyer: 'orange',
  influencer: 'blue',
  internal_coach: 'green',
  advisor: 'purple',
  partner: 'gray',
};

export function StakeholderDirectory({ stakeholders }: StakeholderDirectoryProps) {
  return (
    <div className="space-y-3">
      {stakeholders.map((sh) => (
        <GlassCard key={sh.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">
                    {sh.name}
                  </span>
                  <Badge variant={roleColors[sh.role]}>
                    {STAKEHOLDER_ROLES[sh.role]}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sh.position}
                </p>
              </div>
            </div>
            {sh.phone && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Phone className="h-3 w-3" />
                {sh.phone}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400">影响度</p>
              <p className="text-sm font-medium text-slate-700">
                {sh.influence}/10
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">关系强度</p>
              <p className={cn(
                'text-sm font-medium',
                sh.relationshipStrength > 0 ? 'text-success' :
                sh.relationshipStrength < 0 ? 'text-danger' : 'text-slate-500'
              )}>
                {sh.relationshipStrength > 0 ? '+' : ''}
                {sh.relationshipStrength}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">社交风格</p>
              <p className="text-sm text-slate-700">
                {sh.socialStyle || '-'}
              </p>
            </div>
          </div>

          {sh.coreNeeds && (
            <p className="text-xs text-slate-500 mt-2">
              核心需求: {sh.coreNeeds}
            </p>
          )}
        </GlassCard>
      ))}
      {stakeholders.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">
          暂无干系人信息
        </p>
      )}
    </div>
  );
}
