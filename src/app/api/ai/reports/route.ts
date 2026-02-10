import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opportunities = [] } = body;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, opportunities);
        return NextResponse.json(result);
      } catch { /* fallback */ }
    }

    return NextResponse.json(generateFallback(opportunities));
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, opportunities: any[]) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const summary = opportunities.map((o: any) => ({
    name: o.name,
    stage: o.stage,
    amount: o.expectedAmount,
    winRate: o.winRate,
    risk: o.aiRisk || null,
    owner: o.ownerName,
  }));

  const prompt = `你是一位资深销售管理顾问。根据以下商机数据，生成销售分析报告。

商机数据：
${JSON.stringify(summary, null, 2)}

请严格按以下JSON格式返回（不要包含markdown代码块标记）：
{
  "overview": {
    "healthScore": <0-100整数>,
    "healthTrend": "<较上月变化描述>",
    "riskCount": <风险商机数>,
    "expectedWinCount": <预计本季度赢单数>,
    "summary": "<2-3段分析摘要文字>"
  },
  "risks": [
    {
      "level": "high|medium|low",
      "opportunity": "<商机名称>",
      "description": "<风险描述>",
      "suggestion": "<建议行动>"
    }
  ],
  "recommendations": [
    {
      "category": "<类别>",
      "title": "<标题>",
      "content": "<具体建议>",
      "priority": "high|medium|low"
    }
  ]
}`;

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

function generateFallback(opportunities: any[]) {
  const active = opportunities.filter((o: any) => o.status === 'active');
  const riskOpps = active.filter((o: any) => o.aiRisk);
  const totalAmount = active.reduce((s: number, o: any) => s + (o.expectedAmount || 0), 0);
  const amountStr = (totalAmount / 10000).toFixed(0);

  const risks = riskOpps.slice(0, 3).map((o: any, i: number) => ({
    level: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
    opportunity: o.name,
    description: o.aiRisk || '该商机存在潜在风险，需要关注。',
    suggestion: '建议尽快安排跟进会议，了解最新情况并制定应对方案。',
  }));

  return {
    overview: {
      healthScore: Math.min(Math.round(active.length > 0
        ? active.reduce((s: number, o: any) => s + (o.winRate || 0), 0) / active.length * 100
        : 50), 100),
      healthTrend: '基于当前数据生成',
      riskCount: riskOpps.length,
      expectedWinCount: active.filter((o: any) => (o.winRate || 0) >= 0.6).length,
      summary: `当前销售管线共有 ${active.length} 个活跃商机，总预期金额约 ${amountStr} 万元。其中 ${riskOpps.length} 个商机存在风险需要关注。`,
    },
    risks,
    recommendations: [
      { category: '管线管理', title: '关注风险商机', content: `当前有 ${riskOpps.length} 个风险商机，建议优先处理。`, priority: 'high' },
      { category: '客户关系', title: '加强客户跟进', content: '建议对长时间未更新的商机安排跟进拜访。', priority: 'medium' },
    ],
  };
}
