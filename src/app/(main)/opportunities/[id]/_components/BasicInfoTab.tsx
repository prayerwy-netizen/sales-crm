'use client';

import { GlassCard, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { STAGES, PRODUCT_LINES, SALES_PATHS, COMPETITION_MODES } from '@/lib/constants';
import type { Opportunity } from '@/types/opportunity';

interface BasicInfoTabProps {
  opportunity: Opportunity;
}

const stageMap = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));
const productMap = Object.fromEntries(PRODUCT_LINES.map((p) => [p.key, p.label]));
const pathMap = Object.fromEntries(SALES_PATHS.map((s) => [s.key, s.label]));
const compMap = Object.fromEntries(COMPETITION_MODES.map((c) => [c.key, c.label]));

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-32 text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

export function BasicInfoTab({ opportunity }: BasicInfoTabProps) {
  return (
    <GlassCard>
      <InfoRow label="商机编号" value={opportunity.id} />
      <InfoRow label="客户名称" value={opportunity.customerName} />
      {opportunity.partnerName && (
        <InfoRow label="合作伙伴" value={opportunity.partnerName} />
      )}
      <InfoRow label="产品线" value={productMap[opportunity.productLine]} />
      <InfoRow label="销售路径" value={pathMap[opportunity.salesPath]} />
      <InfoRow
        label="预期金额"
        value={formatCurrency(opportunity.expectedAmount)}
      />
      <InfoRow label="预计签约日期" value={opportunity.expectedCloseDate} />
      <InfoRow label="竞争模式" value={compMap[opportunity.competitionMode]} />
      <InfoRow label="负责人" value={opportunity.ownerName} />
      <InfoRow label="创建时间" value={opportunity.createdAt} />
      <InfoRow label="最近更新" value={opportunity.updatedAt} />
    </GlassCard>
  );
}
