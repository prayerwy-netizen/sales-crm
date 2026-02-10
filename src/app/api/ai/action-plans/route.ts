import { NextRequest, NextResponse } from 'next/server';
import { generateFallbackPlans, type AIActionPlanRequest } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body: AIActionPlanRequest = await req.json();

    if (!body.dimensionKey || !body.dimensionLabel) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    // 有 API Key 时调用 AI
    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, body);
        return NextResponse.json(result);
      } catch {
        // AI 调用失败，降级到模板
      }
    }

    // Fallback: 基于规则的模板生成
    const result = generateFallbackPlans(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, body: AIActionPlanRequest) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const prompt = `你是一位资深销售顾问。根据以下销售商机的"${body.dimensionLabel}"维度数据，生成2-3条具体可执行的行动计划建议。

当前维度数据：
${JSON.stringify(body.formData, null, 2)}

请以JSON格式返回，格式如下：
{"plans":[{"content":"行动内容","executor":"建议执行人角色","plannedDate":"YYYY-MM-DD","measureResult":"衡量标准"}]}

要求：
1. 行动计划要具体、可执行
2. 日期从今天起7-14天内
3. 衡量结果要可量化
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

  // 提取 JSON（处理可能的 markdown 代码块包裹）
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[0]);
}
