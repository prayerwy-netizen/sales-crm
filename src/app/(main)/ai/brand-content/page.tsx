'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Sparkles, Copy, RefreshCw, Download } from 'lucide-react';

const contentTypes = [
  { value: 'exhibition', label: '展会宣传材料' },
  { value: 'invitation', label: '客户邀请函' },
  { value: 'proposal', label: '产品方案书' },
  { value: 'social', label: '社交媒体内容' },
];

export default function BrandContentPage() {
  const [contentType, setContentType] = useState('exhibition');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated('');
    try {
      const res = await fetch('/api/ai/brand-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, formData }),
      });
      if (!res.ok) throw new Error('请求失败');
      const data = await res.json();
      setGenerated(data.content || '');
    } catch {
      setGenerated('生成失败，请重试。');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">
        品牌内容生成
      </h2>

      {/* Type selector */}
      <div className="max-w-xs">
        <Select
          label="内容类型"
          value={contentType}
          onChange={(e) => {
            setContentType(e.target.value);
            setGenerated('');
            setFormData({});
          }}
          options={contentTypes}
        />
      </div>

      <div className="flex gap-4 min-h-[500px]">
        {/* Left: Input form */}
        <div className="w-[40%] shrink-0">
          <ContentForm
            type={contentType}
            onGenerate={handleGenerate}
            generating={generating}
            formData={formData}
            updateField={updateField}
          />
        </div>

        {/* Right: Output */}
        <div className="flex-1">
          <GeneratedContent
            content={generated}
            generating={generating}
            onRegenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
}


function ContentForm({
  type,
  onGenerate,
  generating,
  formData,
  updateField,
}: {
  type: string;
  onGenerate: () => void;
  generating: boolean;
  formData: Record<string, string>;
  updateField: (key: string, value: string) => void;
}) {
  return (
    <GlassCard className="h-full">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">输入信息</h4>
      <div className="space-y-4">
        {type === 'exhibition' && <ExhibitionForm formData={formData} updateField={updateField} />}
        {type === 'invitation' && <InvitationForm formData={formData} updateField={updateField} />}
        {type === 'proposal' && <ProposalForm formData={formData} updateField={updateField} />}
        {type === 'social' && <SocialForm formData={formData} updateField={updateField} />}
        <Button onClick={onGenerate} disabled={generating} className="w-full">
          <Sparkles className="h-4 w-4 mr-1" />
          {generating ? 'AI 生成中...' : 'AI 生成'}
        </Button>
      </div>
    </GlassCard>
  );
}

interface FormProps {
  formData: Record<string, string>;
  updateField: (key: string, value: string) => void;
}

function ExhibitionForm({ formData, updateField }: FormProps) {
  return (
    <>
      <Input label="展会名称" placeholder="如：2026中国矿山安全技术装备博览会" value={formData['展会名称'] || ''} onChange={(e) => updateField('展会名称', e.target.value)} />
      <Input label="展会主题" placeholder="如：AI赋能矿山安全" value={formData['展会主题'] || ''} onChange={(e) => updateField('展会主题', e.target.value)} />
      <Input label="目标客户画像" placeholder="如：煤矿集团安全部门负责人" value={formData['目标客户画像'] || ''} onChange={(e) => updateField('目标客户画像', e.target.value)} />
      <Input label="重点产品" placeholder="如：OAG作业安全引导智能体" value={formData['重点产品'] || ''} onChange={(e) => updateField('重点产品', e.target.value)} />
    </>
  );
}

function InvitationForm({ formData, updateField }: FormProps) {
  return (
    <>
      <Input label="客户名称" placeholder="请输入客户名称" value={formData['客户名称'] || ''} onChange={(e) => updateField('客户名称', e.target.value)} />
      <Input label="活动类型" placeholder="如：技术交流会" value={formData['活动类型'] || ''} onChange={(e) => updateField('活动类型', e.target.value)} />
      <Input label="活动时间" type="date" value={formData['活动时间'] || ''} onChange={(e) => updateField('活动时间', e.target.value)} />
      <Input label="活动地点" placeholder="请输入活动地点" value={formData['活动地点'] || ''} onChange={(e) => updateField('活动地点', e.target.value)} />
    </>
  );
}

function ProposalForm({ formData, updateField }: FormProps) {
  return (
    <>
      <Input label="客户名称" placeholder="请输入客户名称" value={formData['客户名称'] || ''} onChange={(e) => updateField('客户名称', e.target.value)} />
      <Select
        label="产品线"
        value={formData['产品线'] || 'full'}
        onChange={(e) => updateField('产品线', e.target.value)}
        options={[
          { value: 'full', label: '全案建设' },
          { value: 'saas', label: 'SaaS订阅' },
          { value: 'maas', label: 'MaaS服务' },
        ]}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">补充需求</label>
        <textarea
          rows={3}
          placeholder="描述客户的特殊需求..."
          value={formData['补充需求'] || ''}
          onChange={(e) => updateField('补充需求', e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </>
  );
}

function SocialForm({ formData, updateField }: FormProps) {
  return (
    <>
      <Select
        label="平台"
        value={formData['平台'] || 'wechat'}
        onChange={(e) => updateField('平台', e.target.value)}
        options={[
          { value: 'wechat', label: '微信公众号' },
          { value: 'douyin', label: '抖音' },
          { value: 'linkedin', label: 'LinkedIn' },
        ]}
      />
      <Input label="主题" placeholder="如：矿山安全AI解决方案" value={formData['主题'] || ''} onChange={(e) => updateField('主题', e.target.value)} />
      <Input label="关键词" placeholder="如：矿山安全、AI智能体" value={formData['关键词'] || ''} onChange={(e) => updateField('关键词', e.target.value)} />
    </>
  );
}

function GeneratedContent({
  content,
  generating,
  onRegenerate,
}: {
  content: string;
  generating: boolean;
  onRegenerate: () => void;
}) {
  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">生成结果</h4>
        {content && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(content)}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              复制
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" />
              导出
            </Button>
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              重新生成
            </Button>
          </div>
        )}
      </div>

      {generating ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            AI 正在生成内容...
          </div>
        </div>
      ) : content ? (
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-slate-400">
            填写左侧信息后点击"AI生成"
          </p>
        </div>
      )}
    </GlassCard>
  );
}
