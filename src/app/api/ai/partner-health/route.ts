import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partner } = body;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, partner);
        return NextResponse.json(result);
      } catch { /* fallback */ }
    }

    return NextResponse.json(generateFallback(partner));
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, p: any) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const prompt = `你是一位渠道管理专家。根据以下合作伙伴信息，给出健康度评估。

合作伙伴信息：
- 名称：${p.name}
- 区域：${p.region}
- 合作模式：${p.cooperationMode === 'direct_commission' ? '直签佣金制' : '转售折扣制'}
- 合作状态：${p.status}
- 技术交付能力：${p.techCapability}/10
- 客户资源覆盖：${p.customerCoverage}/10
- 历史合作评价：${p.historicalRating}/10
- 转化率：${Math.round((p.conversionRate || 0) * 100)}%
- 商机数量：${p.opportunityCount || 0}

请严格按以下JSON格式返回（不要包含markdown代码块标记）：
{
  "healthScore": <1-10整数>,
  "status": "健康|需关注|风险",
  "insights": [
    { "type": "warning|positive", "content": "<具体分析，1-2句话>" }
  ]
}

要求：返回2-4条insights，结合伙伴实际数据给出具体建议。`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

function generateFallback(p: any) {
  const avg = Math.round(
    ((p.techCapability || 0) + (p.customerCoverage || 0) + (p.historicalRating || 0)) / 3
  );
  const isHealthy = avg >= 7;
  const insights: { type: string; content: string }[] = [];

  if ((p.conversionRate || 0) < 0.5) {
    insights.push({ type: 'warning', content: '转化率低于50%，建议加强终端客户直接技术交流。' });
  }
  if (p.status === 'observing') {
    insights.push({ type: 'warning', content: '合作状态为观察期，需持续跟踪业绩表现。' });
  }
  if ((p.techCapability || 0) < 6) {
    insights.push({ type: 'warning', content: '技术交付能力偏低，建议安排技术培训和赋能。' });
  }
  if (isHealthy) {
    insights.push({ type: 'positive', content: '合作伙伴整体表现良好，建议扩大合作范围。' });
  }
  if (insights.length === 0) {
    insights.push({ type: 'positive', content: '各项指标正常，建议保持当前合作节奏。' });
  }

  return {
    healthScore: avg,
    status: avg >= 7 ? '健康' : avg >= 5 ? '需关注' : '风险',
    insights,
  };
}
