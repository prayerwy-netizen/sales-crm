import { NextRequest, NextResponse } from 'next/server';

interface ChatParseRequest {
  message: string;
  opportunityId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatParseRequest = await req.json();

    if (!body.message || !body.opportunityId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, body.message);
        return NextResponse.json(result);
      } catch {
        // AI 调用失败，降级到模板
      }
    }

    // Fallback: 基于关键词的简单解析
    const result = fallbackParse(body.message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, message: string) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const prompt = `你是一位销售CRM数据录入助手。用户会用自然语言描述拜访情况、客户反馈或竞争动态。
请从用户描述中提取结构化数据，映射到以下十个评估维度：

维度列表：
- dim1 附1-客户购买意愿：客户分类、资金计划、紧迫程度、决策时间
- dim2 附2-客户关系：关键人物、关系强度、社交风格、商务关系
- dim3 附3-需求分析：客户痛点、需求描述、目标期望
- dim4 附4-竞争情况：竞争对手、优劣势、竞争策略
- dim5 附5-解决方案：方案描述、客户认可度
- dim6 附6-价值主张：定量价值、定性价值
- dim7 附7-交付团队：SE/SA/BA角色、工期
- dim8 附8-交付能力：标准化程度、可交付性、关键节点
- dim9 附9-报价策略：报价金额、折扣、付款方式
- dim10 附10-利润率：利润档位、达标情况

用户描述：
${message}

请以JSON格式返回，格式如下：
{
  "reply": "对用户的回复，总结你识别到的信息",
  "fields": [
    {
      "dimension": "维度标签（如：附1-客户购买意愿）",
      "dimensionKey": "维度key（如：dim1）",
      "field": "具体字段名",
      "value": "解析出的值"
    }
  ]
}

要求：
1. 只提取用户明确提到的信息，不要猜测
2. reply 要简洁友好，列出识别到的关键信息
3. 只返回JSON，不要其他文字`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
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

function fallbackParse(message: string) {
  const fields: Array<{
    dimension: string;
    dimensionKey: string;
    field: string;
    value: string;
  }> = [];

  // 简单关键词匹配
  if (/客户|分类|意愿/.test(message)) {
    fields.push({
      dimension: '附1-客户购买意愿',
      dimensionKey: 'dim1',
      field: '客户分类',
      value: /机会/.test(message) ? '机会客户' : '潜在客户',
    });
  }

  if (/关系|支持|反对|中立/.test(message)) {
    fields.push({
      dimension: '附2-客户关系',
      dimensionKey: 'dim2',
      field: '关系强度',
      value: /支持/.test(message) ? '+2（支持）' : /反对/.test(message) ? '-2（反对）' : '0（中立）',
    });
  }

  if (/痛点|问题|困难|挑战/.test(message)) {
    const match = message.match(/痛点[是为：:]+(.+?)[，。,.\n]/);
    fields.push({
      dimension: '附3-需求分析',
      dimensionKey: 'dim3',
      field: '客户痛点',
      value: match?.[1] || '已识别痛点（请在右侧确认具体内容）',
    });
  }

  if (/竞争|对手|竞品/.test(message)) {
    fields.push({
      dimension: '附4-竞争情况',
      dimensionKey: 'dim4',
      field: '竞争对手',
      value: '已识别竞争信息（请在右侧确认具体内容）',
    });
  }

  if (/报价|价格|金额/.test(message)) {
    fields.push({
      dimension: '附9-报价策略',
      dimensionKey: 'dim9',
      field: '报价信息',
      value: '已识别报价信息（请在右侧确认具体内容）',
    });
  }

  const reply = fields.length > 0
    ? `我从你的描述中识别到了 ${fields.length} 条信息，请在右侧确认解析结果。`
    : '抱歉，我没有从你的描述中识别到可录入的结构化数据。请尝试更详细地描述拜访情况。';

  return { reply, fields };
}
