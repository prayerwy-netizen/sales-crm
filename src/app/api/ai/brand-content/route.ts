import { NextRequest, NextResponse } from 'next/server';

interface BrandContentRequest {
  contentType: string;
  formData: Record<string, string>;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  exhibition: '展会宣传材料',
  invitation: '客户邀请函',
  proposal: '产品方案书',
  social: '社交媒体内容',
};

export async function POST(req: NextRequest) {
  try {
    const body: BrandContentRequest = await req.json();

    if (!body.contentType || !body.formData) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const content = await callAI(apiKey, baseUrl, body);
        return NextResponse.json({ content });
      } catch {
        // AI 调用失败，降级到模板
      }
    }

    // Fallback: 返回模板内容
    const content = generateFallback(body);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function callAI(apiKey: string, baseUrl: string, body: BrandContentRequest) {
  const model = process.env.AI_MODEL || 'gemini-3-pro-preview';
  const typeLabel = CONTENT_TYPE_LABELS[body.contentType] || body.contentType;

  const prompt = buildPrompt(typeLabel, body.contentType, body.formData);

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!res.ok) throw new Error(`AI API error: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  return content;
}

function buildPrompt(typeLabel: string, type: string, formData: Record<string, string>): string {
  const base = `你是一位专业的B2B营销文案专家，擅长矿山安全和工业AI领域的品牌内容创作。请根据以下信息生成一份${typeLabel}。`;

  const fields = Object.entries(formData)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}：${v}`)
    .join('\n');

  const typeInstructions: Record<string, string> = {
    exhibition: '要求：突出产品技术优势和行业地位，包含展位亮点、核心产品、成功案例，语言专业有感染力。使用Markdown格式。',
    invitation: '要求：语气正式诚恳，包含活动信息、议程亮点、参会价值，格式规范。使用Markdown格式。',
    proposal: '要求：结构清晰专业，包含项目背景、解决方案、预期收益、投资概算等章节。使用Markdown格式。',
    social: '要求：根据平台特点调整风格，微信公众号要有深度，抖音要简短有力，LinkedIn要专业国际化。包含标题、导语、正文、标签。',
  };

  return `${base}\n\n输入信息：\n${fields}\n\n${typeInstructions[type] || '使用Markdown格式输出。'}`;
}

function generateFallback(body: BrandContentRequest): string {
  const { contentType, formData } = body;

  switch (contentType) {
    case 'exhibition':
      return `# ${formData['展会名称'] || '矿山安全技术装备博览会'} - 展会宣传文案\n\n## 主题：${formData['展会主题'] || 'AI赋能矿山安全'}\n\n### 展位亮点\n\n**核心展品：OAG作业安全引导智能体**\n\n目标客户：${formData['目标客户画像'] || '矿山安全管理人员'}\n\n重点产品：${formData['重点产品'] || 'OAG作业安全引导智能体'}\n\n---\n*（此为模板内容，配置AI API后可生成更丰富的内容）*`;

    case 'invitation':
      return `尊敬的 ${formData['客户名称'] || '[客户名称]'} 领导：\n\n诚挚邀请您参加"${formData['活动类型'] || '技术交流会'}"。\n\n**活动信息**\n- 时间：${formData['活动时间'] || '[待定]'}\n- 地点：${formData['活动地点'] || '[待定]'}\n\n期待您的莅临指导！\n\n---\n*（此为模板内容，配置AI API后可生成更丰富的内容）*`;

    case 'proposal':
      return `# ${formData['客户名称'] || '[客户名称]'} 矿山作业安全智能体解决方案\n\n## 一、项目背景\n基于贵矿当前安全管理需求，提供解决方案。\n\n## 二、产品线\n${formData['产品线'] || '全案建设'}\n\n## 三、补充需求\n${formData['补充需求'] || '无'}\n\n---\n*（此为模板内容，配置AI API后可生成更丰富的内容）*`;

    case 'social':
      return `【${formData['平台'] === 'douyin' ? '抖音' : formData['平台'] === 'linkedin' ? 'LinkedIn' : '微信公众号'}推文】\n\n主题：${formData['主题'] || '矿山安全AI解决方案'}\n\n关键词：${formData['关键词'] || '矿山安全、AI智能体'}\n\n---\n*（此为模板内容，配置AI API后可生成更丰富的内容）*`;

    default:
      return '不支持的内容类型';
  }
}
