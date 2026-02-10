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

const roleOptions = [
  { value: '', label: '请选择角色' },
  { value: 'decision_maker', label: '关键决策人' },
  { value: 'key_buyer', label: '关键买家' },
  { value: 'influencer', label: '影响人' },
  { value: 'connector', label: '内部牵线人' },
  { value: 'advisor', label: '建议人' },
  { value: 'partner', label: '合作伙伴' },
];

const socialStyleOptions = [
  { value: '', label: '请选择社交风格' },
  { value: 'driver', label: '驾驭型' },
  { value: 'expressive', label: '表现型' },
  { value: 'amiable', label: '亲切型' },
  { value: 'analytical', label: '分析型' },
];

const meetingOptions = [
  { value: '', label: '请选择' },
  { value: 'visit', label: '拜访' },
  { value: 'phone', label: '电话' },
  { value: 'wechat', label: '微信' },
  { value: 'email', label: '邮件' },
  { value: 'feishu', label: '飞书' },
];

const frequencyOptions = [
  { value: '', label: '请选择' },
  { value: 'weekly', label: '每周' },
  { value: 'biweekly', label: '每两周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
];

const selfAssessmentOptions = [
  { grade: 'A' as const, label: '与关键决策人建立了深度信任关系' },
  { grade: 'B' as const, label: '与多数干系人保持良好关系' },
  { grade: 'C' as const, label: '仅与部分干系人有接触' },
  { grade: 'D' as const, label: '客户关系薄弱，缺少关键人脉' },
  { grade: 'E' as const, label: '无法判断' },
];

interface Stakeholder {
  id: number;
  name: string;
  position: string;
  role: string;
  impact: string;
  relationship: string;
  meetsNeeds: string;
  socialStyle: string;
  coreNeeds: string;
  strategy: string;
}

const emptyStakeholder = (): Stakeholder => ({
  id: Date.now() + Math.random(),
  name: '',
  position: '',
  role: '',
  impact: '',
  relationship: '0',
  meetsNeeds: '',
  socialStyle: '',
  coreNeeds: '',
  strategy: '',
});

export function Dim2CustomerRelationshipForm({ opportunityId }: { opportunityId?: string }) {
  // 客户负责人
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // 干系人列表
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([emptyStakeholder()]);
  const [priorityId, setPriorityId] = useState<number | null>(null);

  // 会谈信息
  const [meetingFormat, setMeetingFormat] = useState('');
  const [frequency, setFrequency] = useState('');
  const [recentMeeting, setRecentMeeting] = useState('');

  // 自评 & 行动计划
  const [selfGrade, setSelfGrade] = useState('');
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);

  const { initialData, saveData } = useDimensionPersistence(opportunityId, 'dim2');

  useEffect(() => {
    if (!initialData) return;
    if (initialData.contactName) setContactName(initialData.contactName as string);
    if (initialData.contactPosition) setContactPosition(initialData.contactPosition as string);
    if (initialData.contactPhone) setContactPhone(initialData.contactPhone as string);
    if (initialData.stakeholders) setStakeholders(initialData.stakeholders as Stakeholder[]);
    if (initialData.priorityId != null) setPriorityId(initialData.priorityId as number);
    if (initialData.meetingFormat) setMeetingFormat(initialData.meetingFormat as string);
    if (initialData.frequency) setFrequency(initialData.frequency as string);
    if (initialData.recentMeeting) setRecentMeeting(initialData.recentMeeting as string);
    if (initialData.selfGrade) setSelfGrade(initialData.selfGrade as string);
    if (initialData.actionPlans) setActionPlans(initialData.actionPlans as ActionPlanItem[]);
  }, [initialData]);

  const getFormData = useCallback(() => ({
    contactName, contactPosition, stakeholderCount: stakeholders.filter(s => s.name).length,
    meetingFormat, frequency, recentMeeting,
  }), [contactName, contactPosition, stakeholders, meetingFormat, frequency, recentMeeting]);

  const { aiLoading, requestAI } = useAIActionPlans({
    dimensionKey: 'dim2',
    dimensionLabel: '客户关系',
    getFormData,
    actionPlans,
    setActionPlans,
  });

  // Auto-save
  useEffect(() => {
    if (!initialData && !contactName && stakeholders.every(s => !s.name)) return;
    saveData({
      contactName, contactPosition, contactPhone,
      stakeholders, priorityId,
      meetingFormat, frequency, recentMeeting,
      selfGrade, actionPlans,
    });
  }, [contactName, contactPosition, contactPhone, stakeholders, priorityId, meetingFormat, frequency, recentMeeting, selfGrade, actionPlans, saveData, initialData]);

  const addStakeholder = () => {
    setStakeholders((prev) => [...prev, emptyStakeholder()]);
  };

  const removeStakeholder = (id: number) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
    if (priorityId === id) setPriorityId(null);
  };

  const updateStakeholder = (id: number, field: keyof Stakeholder, value: string) => {
    setStakeholders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // 加权评分：按影响度加权关系强度
  const weightedScore = useMemo(() => {
    const valid = stakeholders.filter(
      (s) => s.impact && s.relationship && parseFloat(s.impact) > 0
    );
    if (valid.length === 0) return null;

    const totalImpact = valid.reduce((sum, s) => sum + parseFloat(s.impact), 0);
    if (totalImpact === 0) return null;

    const weighted = valid.reduce((sum, s) => {
      const impact = parseFloat(s.impact);
      const rel = parseFloat(s.relationship);
      // 关系强度 -3~+3 → 归一化到 0~10: (rel + 3) / 6 * 10
      const normalized = ((rel + 3) / 6) * 10;
      return sum + (impact / totalImpact) * normalized;
    }, 0);

    return parseFloat(weighted.toFixed(1));
  }, [stakeholders]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        评估与客户关键干系人的关系推进情况。按角色影响度加权计算关系强度得分。
      </p>

      {/* 客户负责人信息 */}
      <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
        <span className="text-xs font-medium text-slate-500">客户负责人</span>
        <div className="grid grid-cols-3 gap-3">
          <Input label="姓名" placeholder="姓名" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <Input label="职位" placeholder="职位" value={contactPosition} onChange={(e) => setContactPosition(e.target.value)} />
          <Input label="联系方式" placeholder="电话/微信" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      {/* 干系人列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">核心干系人列表</label>
          <Button variant="ghost" size="sm" onClick={addStakeholder}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            添加干系人
          </Button>
        </div>

        {stakeholders.map((sh, idx) => (
          <StakeholderCard
            key={sh.id}
            index={idx}
            stakeholder={sh}
            isPriority={priorityId === sh.id}
            onSetPriority={() => setPriorityId(sh.id === priorityId ? null : sh.id)}
            onUpdate={(field, value) => updateStakeholder(sh.id, field, value)}
            onRemove={() => removeStakeholder(sh.id)}
            canRemove={stakeholders.length > 1}
          />
        ))}
      </div>

      {/* 会谈信息 */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        <Select label="会谈形式" options={meetingOptions} value={meetingFormat} onChange={(e) => setMeetingFormat(e.target.value)} />
        <Select label="会谈频率" options={frequencyOptions} value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        <Input label="近期会谈时间" type="date" value={recentMeeting} onChange={(e) => setRecentMeeting(e.target.value)} />
      </div>

      {/* 评分面板 */}
      <ScorePanel
        items={[
          { label: '加权关系强度', value: weightedScore, suffix: '分' },
          { label: '干系人数', value: stakeholders.filter((s) => s.name).length, suffix: '人' },
        ]}
        total={weightedScore}
        totalLabel="内容得分"
      />

      {/* 自评 */}
      <SelfAssessment options={selfAssessmentOptions} value={selfGrade} onChange={setSelfGrade} />

      {/* 行动计划 */}
      <ActionPlanTable items={actionPlans} onChange={setActionPlans} onRequestAI={requestAI} aiLoading={aiLoading} />
    </div>
  );
}

function StakeholderCard({
  index, stakeholder, isPriority, onSetPriority, onUpdate, onRemove, canRemove,
}: {
  index: number;
  stakeholder: Stakeholder;
  isPriority: boolean;
  onSetPriority: () => void;
  onUpdate: (field: keyof Stakeholder, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const meetsNeedsOptions = [
    { value: '', label: '请选择' },
    { value: 'yes', label: '是' },
    { value: 'no', label: '否' },
  ];

  return (
    <div className={`rounded-lg border p-3 space-y-3 ${isPriority ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white/60'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">干系人 #{index + 1}</span>
          <button
            type="button"
            onClick={onSetPriority}
            className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${isPriority ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {isPriority ? '优先突破' : '设为优先'}
          </button>
        </div>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label="姓名" placeholder="姓名" value={stakeholder.name} onChange={(e) => onUpdate('name', e.target.value)} />
        <Input label="职位" placeholder="职位" value={stakeholder.position} onChange={(e) => onUpdate('position', e.target.value)} />
        <Select label="角色" options={roleOptions} value={stakeholder.role} onChange={(e) => onUpdate('role', e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label="签单影响度(%)" type="number" min={0} max={100} placeholder="0-100" value={stakeholder.impact} onChange={(e) => onUpdate('impact', e.target.value)} />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            关系强度: {stakeholder.relationship}
          </label>
          <input type="range" min={-3} max={3} step={1} value={stakeholder.relationship} onChange={(e) => onUpdate('relationship', e.target.value)} className="w-full accent-primary" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-3 对立</span><span>0 中立</span><span>+3 支持</span>
          </div>
        </div>
        <Select label="满足商务需求" options={meetsNeedsOptions} value={stakeholder.meetsNeeds} onChange={(e) => onUpdate('meetsNeeds', e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select label="社交风格" options={socialStyleOptions} value={stakeholder.socialStyle} onChange={(e) => onUpdate('socialStyle', e.target.value)} />
        <Input label="核心需求" placeholder="该干系人的核心诉求" value={stakeholder.coreNeeds} onChange={(e) => onUpdate('coreNeeds', e.target.value)} />
        <Input label="关系策略" placeholder="推进关系的策略" value={stakeholder.strategy} onChange={(e) => onUpdate('strategy', e.target.value)} />
      </div>
    </div>
  );
}
