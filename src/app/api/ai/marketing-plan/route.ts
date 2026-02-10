import { NextRequest, NextResponse } from 'next/server';

interface MarketingPlanRequest {
  customerName: string;
  mineType: string;
  region: string;
  tier: string;
  annualCapacity?: string;
  group?: string;
  opportunityCount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: MarketingPlanRequest = await req.json();

    if (!body.customerName) {
      return NextResponse.json({ error: '缺少客户信息' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, body);
        return NextResponse.json(result);
      } catch {
        // AI 调用失败，降级到模板
      }
    }

    const result = generateFallbackPlan(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, body: MarketingPlanRequest) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const prompt = `你是一位矿业智能化领域的资深营销顾问。请根据以下客户信息，生成一份针对性的营销方案。

客户信息：
- 客户名称：${body.customerName}
- 矿种：${body.mineType}
- 地区：${body.region}
- 客户层级：${body.tier}
- 年产能：${body.annualCapacity || '未知'}
- 所属集团：${body.group || '未知'}
- 当前商机数：${body.opportunityCount ?? 0}

请以JSON格式返回，格式如下：
{"title":"方案标题","summary":"一句话概述","strategies":[{"name":"策略名称","description":"策略描述","actions":["具体行动1","具体行动2"]}],"keyMessages":["核心卖点1","核心卖点2"],"timeline":"建议推进节奏"}

要求：
1. 策略要针对该客户的行业特点和规模
2. 行动要具体可执行
3. 核心卖点要突出差异化价值
4. 只返回JSON，不要其他文字`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`AI API error: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[0]);
}

function generateFallbackPlan(body: MarketingPlanRequest) {
  const isLarge = body.tier === 'top30';
  const mineLabel = body.mineType === 'coal' ? '煤矿' : body.mineType === 'metal' ? '金属矿' : '非金属矿';

  return {
    title: `${body.customerName} 智能化营销方案`,
    summary: `针对${body.region}地区${mineLabel}客户的智能化解决方案推广计划`,
    strategies: [
      {
        name: '技术交流切入',
        description: `组织${mineLabel}智能化技术交流会，展示行业标杆案例`,
        actions: [
          `邀请${body.customerName}技术负责人参加线下技术沙龙`,
          '准备同区域同类型矿井的成功案例材料',
          '安排产品演示和现场参观',
        ],
      },
      {
        name: isLarge ? '集团战略合作' : '试点项目推进',
        description: isLarge
          ? `与${body.group || body.customerName}建立集团级战略合作框架`
          : '从单一场景切入，快速验证价值',
        actions: isLarge
          ? ['推动高层互访，建立战略合作意向', '制定集团级推广路线图', '争取框架协议签署']
          : ['选择1-2个痛点场景做试点', '制定30天快速验证计划', '明确试点成功标准和扩展路径'],
      },
      {
        name: '价值量化驱动',
        description: '用数据说话，量化智能化带来的降本增效价值',
        actions: [
          '收集客户当前运营数据作为基线',
          '制作定制化ROI分析报告',
          '提供同行业对标数据支撑决策',
        ],
      },
    ],
    keyMessages: [
      `${mineLabel}智能化行业领先解决方案`,
      '已服务多家Top30矿业集团',
      '平均降低运营成本15-25%',
      '从试点到全面推广的成熟路径',
    ],
    timeline: isLarge
      ? '第1-2周技术交流 → 第3-4周高层拜访 → 第5-8周方案定制 → 第9-12周框架签署'
      : '第1周需求调研 → 第2-3周方案演示 → 第4-6周试点启动 → 第7-12周价值验证',
  };
}
