import { NextRequest, NextResponse } from 'next/server';
import { buildPlaybookPrompt, evaluateByPlaybook } from '@/lib/salesPlaybook';
import type { StageKey, DimensionKey } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opportunity } = body;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, opportunity);
        return NextResponse.json(result);
      } catch { /* fallback */ }
    }

    return NextResponse.json(generateFallback(opportunity));
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, opp: any) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const playbookContext = buildPlaybookPrompt(opp.stage as StageKey);

  const prompt = `你是一位资深销售顾问，精通多套销售方法论。根据以下商机信息和销售方法论，给出赢单建议。

商机信息：
- 名称：${opp.name}
- 客户：${opp.customerName}
- 阶段：${opp.stage}
- 预期金额：${opp.expectedAmount}万元
- 当前赢率：${Math.round((opp.winRate || 0) * 100)}%
- 风险提示：${opp.aiRisk || '无'}
- 合作伙伴：${opp.partnerName || '无'}
- 维度评分：${JSON.stringify(opp.dimensionScores || {})}
${playbookContext}

请严格按以下JSON格式返回（不要包含markdown代码块标记）：
{
  "suggestions": [
    { "type": "risk|tip|next", "content": "<建议内容，1-2句话>" }
  ]
}

要求：
- 返回3-5条建议
- type=risk 表示风险警告，type=tip 表示赢单技巧，type=next 表示下一步行动
- 内容必须给出具体的沟通话术、提问脚本或操作步骤，不要只说"用XX方法"或"建议做XX"
- 直接告诉销售"第一句话说什么、问哪个问题、怎么引导"，让销售拿到建议就能立刻执行`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

function generateFallback(opp: any) {
  const suggestions: { type: string; content: string }[] = [];

  if (opp.aiRisk) {
    suggestions.push({ type: 'risk', content: opp.aiRisk });
  }

  // 用销售方法论评估维度数据
  const stage = (opp.stage || 'lead') as StageKey;
  const scores = (opp.dimensionScores || {}) as Partial<Record<DimensionKey, number>>;
  const { risks, actions } = evaluateByPlaybook(stage, scores);

  for (const r of risks.slice(0, 2)) {
    suggestions.push({ type: 'risk', content: r });
  }
  for (const a of actions.slice(0, 2)) {
    suggestions.push({ type: 'next', content: a });
  }

  const winRate = opp.winRate || 0;
  if (winRate < 0.4 && suggestions.length < 4) {
    suggestions.push({ type: 'tip', content: '当前赢率偏低，建议重新评估客户需求匹配度，考虑调整方案策略。' });
  }

  if (suggestions.length < 3) {
    suggestions.push({ type: 'tip', content: '建议完善十维度评估数据，让AI给出更精准的方法论建议。' });
  }

  return { suggestions };
}
