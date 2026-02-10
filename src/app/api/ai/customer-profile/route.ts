import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer } = body;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, customer);
        return NextResponse.json(result);
      } catch { /* fallback */ }
    }

    return NextResponse.json(generateFallback(customer));
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, c: any) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const prompt = `你是一位资深销售顾问。根据以下客户信息，生成客户画像分析。

客户信息：
- 名称：${c.name}
- 行业：${c.industry || '矿业'}
- 矿种：${c.mineType || '未知'}
- 区域：${c.region || '未知'}
- 商机数量：${c.opportunityCount || 0}
- 总金额：${c.totalAmount || 0}万元

请严格按以下JSON格式返回（不要包含markdown代码块标记）：
{
  "profile": [
    { "label": "采购偏好", "content": "<基于客户特征的采购偏好分析>" },
    { "label": "决策链路", "content": "<推测的决策流程>" },
    { "label": "关注重点", "content": "<客户可能关注的重点>" }
  ],
  "valueRating": { "grade": "A|B|C", "label": "<评级描述>", "reason": "<评级原因>" }
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

function generateFallback(c: any) {
  const mineLabel = c.mineType === 'coal' ? '煤矿' : c.mineType === 'metal' ? '金属矿' : '非金属矿';
  const isHighValue = (c.totalAmount || 0) > 5000000 || (c.opportunityCount || 0) >= 3;

  return {
    profile: [
      {
        label: '采购偏好',
        content: `${mineLabel}行业客户，倾向${(c.totalAmount || 0) > 3000000 ? '全案建设方案' : 'SaaS订阅模式'}，注重系统稳定性和售后服务。`,
      },
      {
        label: '决策链路',
        content: '安全部门提出需求 → 信息中心技术评估 → 分管领导审批 → 采购流程',
      },
      {
        label: '关注重点',
        content: '作业安全合规性、系统识别准确率、数据安全、长期运维成本',
      },
    ],
    valueRating: {
      grade: isHighValue ? 'A' : 'B',
      label: isHighValue ? '高价值客户' : '潜力客户',
      reason: isHighValue
        ? '基于历史合作金额和商机数量综合评估'
        : '客户有持续合作潜力，建议加强关系维护',
    },
  };
}
