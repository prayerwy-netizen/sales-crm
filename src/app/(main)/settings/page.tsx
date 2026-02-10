'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui';
import { Settings, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARAMETER_CONFIGS, getLevelStageMatrix } from '@/lib/parameterConfig';
import { STAGES, DIMENSIONS, PRODUCT_LINES } from '@/lib/constants';
import type { EvalLevel } from '@/lib/parameterConfig';

const levelLabels: Record<EvalLevel, { label: string; color: string }> = {
  simplified: { label: '简化评估', color: 'bg-green-100 text-green-700' },
  standard: { label: '标准评估', color: 'bg-blue-100 text-blue-700' },
  complete: { label: '完整评估', color: 'bg-orange-100 text-orange-700' },
};

const productLineLabels: Record<string, string> = Object.fromEntries(
  PRODUCT_LINES.map((p) => [p.key, p.label])
);

export default function SettingsPage() {
  const [expandedLevel, setExpandedLevel] = useState<EvalLevel | null>(null);
  const matrix = getLevelStageMatrix();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Settings className="h-5 w-5 text-slate-500" />
        系统设置
      </h2>

      {/* 9套参数配置表 */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          参数设定规则（9套配置）
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          系统根据商机的产品线和预期金额自动匹配评估流程级别，决定每个阶段需要填写哪些维度。
        </p>
        <ConfigTable />
      </GlassCard>

      {/* 评估级别维度矩阵 */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          评估级别 × 阶段 × 维度矩阵
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          展开查看每个评估级别在各阶段需要填写的维度。
        </p>
        <div className="space-y-2">
          {(['complete', 'standard', 'simplified'] as EvalLevel[]).map((level) => {
            const info = levelLabels[level];
            const isOpen = expandedLevel === level;
            return (
              <div key={level} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedLevel(isOpen ? null : level)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', info.color)}>
                      {info.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {level === 'complete' && '所有适用维度均必填'}
                      {level === 'standard' && '跳过部分非核心维度'}
                      {level === 'simplified' && '仅核心维度必填'}
                    </span>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && <LevelMatrix dims={matrix[level]} />}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function ConfigTable() {
  const grouped = PRODUCT_LINES.map((pl) => ({
    ...pl,
    configs: PARAMETER_CONFIGS.filter((c) => c.productLine === pl.key),
  }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">产品线</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">金额区间</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">评估级别</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">说明</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((group) =>
            group.configs.map((config, idx) => (
              <tr key={`${config.productLine}-${idx}`} className="border-b border-slate-100 last:border-0">
                {idx === 0 && (
                  <td rowSpan={group.configs.length} className="py-2 px-3 font-medium text-slate-700 align-top border-r border-slate-100">
                    {group.label}
                  </td>
                )}
                <td className="py-2 px-3 text-slate-600">{config.amountRange}</td>
                <td className="py-2 px-3">
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', levelLabels[config.evalLevel].color)}>
                    {levelLabels[config.evalLevel].label}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-slate-500">{config.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LevelMatrix({ dims }: { dims: Record<string, string[]> }) {
  const stageKeys = STAGES.filter((s) => s.key !== 'contract');

  return (
    <div className="px-3 pb-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-2 font-medium text-slate-500 w-48">维度</th>
            {stageKeys.map((s) => (
              <th key={s.key} className="text-center py-2 px-2 font-medium text-slate-500">{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIMENSIONS.map((dim) => (
            <tr key={dim.key} className="border-b border-slate-50 last:border-0">
              <td className="py-1.5 px-2 text-slate-700">{dim.label}</td>
              {stageKeys.map((s) => {
                const required = (dims[s.key] || []).includes(dim.key);
                return (
                  <td key={s.key} className="text-center py-1.5 px-2">
                    {required ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-slate-200 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
