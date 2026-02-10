'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';
import { SelfAssessment, ActionPlanTable, ScorePanel } from './shared';
import type { ActionPlanItem } from './shared';
import { useAIActionPlans } from '@/hooks/useAIActionPlans';
import { useDimensionPersistence } from '@/hooks/useDimensionPersistence';

interface RoleMember {
  id: number;
  roleName: string;
  roleType: string;
  name: string;
  joinDate: string;
  estimatedDays: number;
  satisfaction: number;
}

const roleTypeOptions = [
  { value: '', label: '请选择角色类型' },
  { value: 'SE', label: 'SE（售前工程师）' },
  { value: 'SA', label: 'SA（解决方案架构师）' },
  { value: 'BA', label: 'BA（商务分析师）' },
  { value: 'PM', label: 'PM（项目经理）' },
  { value: 'other', label: '其他' },
];

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '团队配置完整，能力完全匹配' },
  { grade: 'B' as const, label: '团队基本到位，能力基本匹配' },
  { grade: 'C' as const, label: '团队部分到位，部分能力需补充' },
  { grade: 'D' as const, label: '团队配置不足，能力缺口较大' },
  { grade: 'E' as const, label: '无法判断' },
];

const emptyRole = (): RoleMember => ({
  id: Date.now() + Math.random(),
  roleName: '',
  roleType: '',
  name: '',
  joinDate: '',
  estimatedDays: 0,
  satisfaction: 60,
});

function getRoleScore(satisfaction: number): number {
  return satisfaction >= 60 ? parseFloat(((satisfaction / 100) * 10).toFixed(1)) : 0;
}

export function Dim7DeliveryTeamForm({ opportunityId }: { opportunityId?: string }) {
  const [roles, setRoles] = useState<RoleMember[]>([emptyRole()]);
  const [otherNotes, setOtherNotes] = useState('');
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim7');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.roles) setRoles(initialData.roles as RoleMember[]);
    if (initialData.otherNotes) setOtherNotes(initialData.otherNotes as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    roleCount: roles.length,
    roleTypes: roles.map(r => r.roleType).filter(Boolean),
  }), [roles]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim7',
    dimensionLabel: '交付团队/技能',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && roles.every(r => !r.name)) return;
    saveData({ roles, otherNotes, selfGrade, actionPlans });
  }, [roles, otherNotes, selfGrade, actionPlans, saveData, initialData]);

  const add = () => setRoles((prev) => [...prev, emptyRole()]);
  const remove = (id: number) => setRoles((prev) => prev.filter((r) => r.id !== id));
  const update = (id: number, field: keyof RoleMember, value: string | number) =>
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const scores = useMemo(() => {
    const seRoles = roles.filter((r) => r.roleType === 'SE');
    const saRoles = roles.filter((r) => r.roleType === 'SA');
    const baRoles = roles.filter((r) => r.roleType === 'BA');

    const avgScore = (list: RoleMember[]) => {
      if (list.length === 0) return null;
      return list.reduce((sum, r) => sum + getRoleScore(r.satisfaction), 0) / list.length;
    };

    const seScore = avgScore(seRoles);
    const saScore = avgScore(saRoles);
    const baScore = avgScore(baRoles);

    const parts: number[] = [];
    let totalWeight = 0;
    if (seScore !== null) { parts.push(seScore * 0.3); totalWeight += 0.3; }
    if (saScore !== null) { parts.push(saScore * 0.3); totalWeight += 0.3; }
    if (baScore !== null) { parts.push(baScore * 0.4); totalWeight += 0.4; }

    const weighted = totalWeight > 0
      ? parseFloat((parts.reduce((a, b) => a + b, 0) / totalWeight * 10 / 10).toFixed(1))
      : null;

    return { seScore, saScore, baScore, weighted };
  }, [roles]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估交付团队配置和技能满足度。满足程度≥60%按比例计分，&lt;60%计0分。权重：SE(0.3) + SA(0.3) + BA(0.4)
      </p>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">角色列表</label>
        <Button variant="ghost" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          添加角色
        </Button>
      </div>

      {roles.map((role, idx) => (
        <RoleCard
          key={role.id}
          index={idx}
          role={role}
          onUpdate={(field, value) => update(role.id, field, value)}
          onRemove={() => remove(role.id)}
          canRemove={roles.length > 1}
        />
      ))}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">其他情况说明</label>
        <textarea
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="补充说明团队配置相关信息..."
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <ScorePanel
        items={[
          { label: 'SE', value: scores.seScore, weight: 0.3 },
          { label: 'SA', value: scores.saScore, weight: 0.3 },
          { label: 'BA', value: scores.baScore, weight: 0.4 },
        ]}
        total={scores.weighted}
      />

      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function RoleCard({
  index, role, onUpdate, onRemove, canRemove,
}: {
  index: number;
  role: RoleMember;
  onUpdate: (field: keyof RoleMember, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const scoreDisplay = getRoleScore(role.satisfaction);

  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">角色 #{index + 1}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select label="角色类型" options={roleTypeOptions} value={role.roleType} onChange={(e) => onUpdate('roleType', e.target.value)} />
        <Input label="角色名称" placeholder="如：高级SE" value={role.roleName} onChange={(e) => onUpdate('roleName', e.target.value)} />
        <Input label="姓名" placeholder="负责人姓名" value={role.name} onChange={(e) => onUpdate('name', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="介入时间" type="date" value={role.joinDate} onChange={(e) => onUpdate('joinDate', e.target.value)} />
        <Input label="预测工期（天）" type="number" min={0} placeholder="天数" value={String(role.estimatedDays || '')} onChange={(e) => onUpdate('estimatedDays', Number(e.target.value))} />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          满足程度: {role.satisfaction}%
          <span className="ml-2 text-xs text-slate-400">(得分: {scoreDisplay})</span>
        </label>
        <input
          type="range" min={0} max={100} step={5} value={role.satisfaction}
          onChange={(e) => onUpdate('satisfaction', Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0%</span>
          <span className="text-orange-400">60% 及格线</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
