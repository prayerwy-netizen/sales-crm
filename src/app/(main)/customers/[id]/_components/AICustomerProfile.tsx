'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui';
import { Sparkles, Target, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import type { Customer } from '@/types/customer';

interface ProfileEntry { label: string; content: string }
interface ValueRating { grade: string; label: string; reason: string }
interface ProfileData {
  profile: ProfileEntry[];
  valueRating: ValueRating;
}

const iconForLabel: Record<string, typeof Target> = {
  '采购偏好': Target,
  '决策链路': TrendingUp,
  '关注重点': Shield,
};

interface AICustomerProfileProps {
  customer: Customer;
}

export function AICustomerProfile({ customer }: AICustomerProfileProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/customer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer }),
      });
      const json = await res.json();
      if (json.profile) setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  }, [customer]);

  useEffect(() => {
    if (customer?.id) fetchProfile();
  }, [customer?.id, fetchProfile]);
  const rating = data?.valueRating;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 客户画像
          </h4>
          <button onClick={fetchProfile} disabled={loading} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="space-y-3">
          {loading && !data && (
            <p className="text-xs text-slate-400 text-center py-3">AI 分析中...</p>
          )}
          {data?.profile.map((item, i) => {
            const Icon = iconForLabel[item.label] || Target;
            return <ProfileItem key={i} icon={Icon} label={item.label} content={item.content} />;
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          客户价值评级
        </h4>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <span className="text-lg font-bold text-white">{rating?.grade ?? '-'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{rating?.label ?? '评估中'}</p>
            <p className="text-xs text-slate-400">{rating?.reason ?? '加载数据后自动评估'}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  content,
}: {
  icon: typeof Target;
  label: string;
  content: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="rounded-lg p-1.5 bg-blue-50 shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-700 mt-0.5">{content}</p>
      </div>
    </div>
  );
}
