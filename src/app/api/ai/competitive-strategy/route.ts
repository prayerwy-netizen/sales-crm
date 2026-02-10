import { NextRequest, NextResponse } from 'next/server';

interface CompetitiveStrategyRequest {
  ourStrengths: string;
  ourWeaknesses: string;
  competitors: { name: string; ourAdvantage: string; ourDisadvantage: string; theirAdvantage: string; theirDisadvantage: string }[];
  comparisonResult: string;
  strategyDirection: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CompetitiveStrategyRequest = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const result = await callAI(apiKey, baseUrl, body);
        return NextResponse.json(result);
      } catch {
        // 降级到模板
      }
    }

    const result = generateFallback(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(
  apiKey: string,
  baseUrl: string,
  body: CompetitiveStrategyRequest
) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';

  const competitorInfo = body.competitors
    .filter((c) => c.name)
    .map(
      (c) =>
        `- ${c.name}：我方优势(${c.ourAdvantage})，我方劣势(${c.ourDisadvantage})，对手优势(${c.theirAdvantage})，对手劣势(${c.theirDisadvantage})`
    )
    .join('\n');

  const prompt = `你是一位资深销售策略顾问。根据以下竞争分析数据，生成差异化竞争应对策略。

我方核心优势：${body.ourStrengths || '未填写'}
我方主要劣势：${body.ourWeaknesses || '未填写'}
竞争对手分析：
${competitorInfo || '暂无竞争对手数据'}
当前比较结果：${body.comparisonResult || '未评估'}
策略方向：${body.strategyDirection || '未确定'}

请以JSON格式返回：
{"strategies":[{"title":"策略标题","description":"策略描述","tactics":["具体战术1","具体战术2"]}],"differentiators":["差异化优势1","差异化优势2"],"risks":["潜在风险1"],"summary":"总体建议"}

要求：
1. 策略要针对具体竞争对手的弱点
2. 战术要可执行
3. 差异化优势要突出我方独特价值
4. 只返回JSON`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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

function generateFallback(body: CompetitiveStrategyRequest) {
  const hasCompetitors = body.competitors.some((c) => c.name);
  const isAdvantage =
    body.comparisonResult === 'strong_advantage' ||
    body.comparisonResult === 'slight_advantage';

  return {
    strategies: [
      {
        title: isAdvantage ? '强化优势壁垒' : '差异化突围',
        description: isAdvantage
          ? '巩固现有竞争优势，扩大领先差距'
          : '避开正面竞争，从差异化角度建立独特价值',
        tactics: isAdvantage
          ? [
              '在客户面前持续展示技术领先性',
              '提供竞争对手无法匹配的增值服务',
              '加速推进项目节奏，缩短竞争窗口期',
            ]
          : [
              '聚焦竞争对手薄弱环节重点突破',
              '提供定制化方案体现灵活性优势',
              '通过试点项目快速建立信任',
            ],
      },
      {
        title: '关系深耕策略',
        description: '通过多层次客户关系建设提升竞争壁垒',
        tactics: [
          '建立高层定期沟通机制',
          '安排技术团队深度对接',
          '组织客户参观成功案例现场',
        ],
      },
    ],
    differentiators: [
      body.ourStrengths || '技术方案的完整性和成熟度',
      '本地化服务响应能力',
      '行业成功案例积累',
    ],
    risks: hasCompetitors
      ? ['竞争对手可能降价抢单', '客户可能延迟决策观望']
      : ['缺少竞争对手信息，策略针对性不足'],
    summary: isAdvantage
      ? '当前竞争态势有利，建议加快推进节奏，同时巩固优势防止对手反击。'
      : '竞争态势需要重视，建议采取差异化策略，避免价格战，聚焦价值竞争。',
  };
}
