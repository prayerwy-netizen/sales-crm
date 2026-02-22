import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: 获取商机的维度数据
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: '未配置 Supabase', data: null },
      { status: 200 }
    );
  }

  const { data, error } = await getAdminClient()!
    .from('sales_crm_dimension_data')
    .select('*')
    .eq('opportunity_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// PUT: 保存/更新维度数据
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: '未配置 Supabase' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { dimensionKey, data: dimData, scores } = body;

  if (!dimensionKey) {
    return NextResponse.json(
      { error: '缺少 dimensionKey' },
      { status: 400 }
    );
  }

  const { data, error } = await getAdminClient()!
    .from('sales_crm_dimension_data')
    .upsert(
      {
        opportunity_id: id,
        dimension_key: dimensionKey,
        data: dimData,
        scores,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'opportunity_id,dimension_key' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
