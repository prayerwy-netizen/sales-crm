import { NextRequest, NextResponse } from 'next/server';

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

  const prompt = `你是一位资深销售顾问。根据以下商机信息，给出赢单建议。

商机信息：
- 名称：${opp.name}
- 客户：${opp.customerName}
- 阶段：${opp.stage}
- 预期金额：${opp.expectedAmount}万元
- 当前赢率：${Math.round((opp.winRate || 0) * 100)}%
- 风险提示：${opp.aiRisk || '无'}
- 合作伙伴：${opp.partnerName || '无'}

请严格按以下JSON格式返回（不要包含markdown代码块标记）：
{
  "suggestions": [
    { "type": "risk|tip|next", "content": "<建议内容，1-2句话>" }
  ]
}

要求：
- 返回3-5条建议
- type=risk 表示风险警告，type=tip 表示赢单技巧，type=next 表示下一步行动
- 内容要具体、可执行，结合商机实际情况`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
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

  const winRate = opp.winRate || 0;
  if (winRate < 0.4) {
    suggestions.push({ type: 'tip', content: '当前赢率偏低，建议重新评估客户需求匹配度，考虑调整方案策略。' });
  } else if (winRate >= 0.7) {
    suggestions.push({ type: 'tip', content: '赢率较高，建议加速推进合同条款确认，锁定成交节奏。' });
  }

  const stageMap: Record<string, string> = {
    lead: '建议尽快完成客户需求初步调研，明确项目预算和决策流程。',
    qualification: '建议完善十维度评估数据，识别关键风险点。',
    proposal: '建议准备差异化方案，突出核心竞争优势。',
    negotiation: '建议关注合同条款细节，提前准备价格谈判策略。',
    closing: '建议确认所有审批流程已完成，准备签约材料。',
  };

  const nextStep = stageMap[opp.stage] || '建议定期跟进客户，保持沟通频率。';
  suggestions.push({ type: 'next', content: nextStep });

  if (suggestions.length < 3) {
    suggestions.push({ type: 'tip', content: '建议安排一次技术交流会，展示产品差异化优势。' });
  }

  return { suggestions };
}
