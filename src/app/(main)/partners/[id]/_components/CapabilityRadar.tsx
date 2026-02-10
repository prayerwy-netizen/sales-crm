'use client';

import { GlassCard } from '@/components/ui';
import { RadarChart } from '@/components/charts/RadarChart';
import type { Partner } from '@/types/partner';

interface CapabilityRadarProps {
  partner: Partner;
}

export function CapabilityRadar({ partner }: CapabilityRadarProps) {
  const data = [
    { subject: '技术交付', value: partner.techCapability, fullMark: 10 },
    { subject: '客户覆盖', value: partner.customerCoverage, fullMark: 10 },
    { subject: '历史评价', value: partner.historicalRating, fullMark: 10 },
    { subject: '转化能力', value: Math.round(partner.conversionRate * 10), fullMark: 10 },
    { subject: '响应速度', value: 7, fullMark: 10 },
  ];

  return (
    <GlassCard>
      <h4 className="text-sm font-semibold text-slate-800 mb-2">
        能力评估雷达图
      </h4>
      <RadarChart data={data} />
    </GlassCard>
  );
}
