import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamel } from '@/lib/db-utils';
import { mockOpportunities } from '@/data/opportunities';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    const opp = mockOpportunities.find((o) => o.id === id);
    if (!opp) return NextResponse.json({ error: '未找到' }, { status: 404 });
    return NextResponse.json({ data: opp });
  }

  const { data, error } = await supabase!
    .from('sales_crm_opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamel(data) });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.name !== undefined) updateFields.name = body.name;
  if (body.customerId !== undefined) updateFields.customer_id = body.customerId;
  if (body.customerName !== undefined) updateFields.customer_name = body.customerName;
  if (body.partnerId !== undefined) updateFields.partner_id = body.partnerId;
  if (body.partnerName !== undefined) updateFields.partner_name = body.partnerName;
  if (body.productLine !== undefined) updateFields.product_line = body.productLine;
  if (body.salesPath !== undefined) updateFields.sales_path = body.salesPath;
  if (body.expectedAmount !== undefined) updateFields.expected_amount = body.expectedAmount;
  if (body.expectedCloseDate !== undefined) updateFields.expected_close_date = body.expectedCloseDate;
  if (body.competitionMode !== undefined) updateFields.competition_mode = body.competitionMode;
  if (body.stage !== undefined) updateFields.stage = body.stage;
  if (body.status !== undefined) updateFields.status = body.status;
  if (body.winRate !== undefined) updateFields.win_rate = body.winRate;
  if (body.aiRisk !== undefined) updateFields.ai_risk = body.aiRisk;

  const { data, error } = await supabase!
    .from('sales_crm_opportunities')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamel(data) });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const { error } = await supabase!
    .from('sales_crm_opportunities')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
