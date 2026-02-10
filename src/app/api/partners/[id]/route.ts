import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamel } from '@/lib/db-utils';
import { mockPartners } from '@/data/partners';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    const partner = mockPartners.find((p) => p.id === id);
    if (!partner) return NextResponse.json({ error: '未找到' }, { status: 404 });
    return NextResponse.json({ data: partner });
  }

  const { data, error } = await supabase!
    .from('sales_crm_partners')
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
  const { data, error } = await supabase!
    .from('sales_crm_partners')
    .update({
      name: body.name,
      region: body.region,
      cooperation_mode: body.cooperationMode,
      status: body.status,
      contact_name: body.contactName,
      contact_phone: body.contactPhone,
      contact_email: body.contactEmail,
      tech_capability: body.techCapability,
      customer_coverage: body.customerCoverage,
      historical_rating: body.historicalRating,
      profit_share_ratio: body.profitShareRatio,
    })
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
    .from('sales_crm_partners')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
