import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamel } from '@/lib/db-utils';
import { mockCustomers } from '@/data/customers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    const customer = mockCustomers.find((c) => c.id === id);
    if (!customer) return NextResponse.json({ error: '未找到' }, { status: 404 });
    return NextResponse.json({ data: customer });
  }

  const { data, error } = await supabase!
    .from('sales_crm_customers')
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
    .from('sales_crm_customers')
    .update({
      name: body.name,
      mine_type: body.mineType,
      group: body.group,
      region: body.region,
      tier: body.tier,
      category: body.category,
      annual_capacity: body.annualCapacity,
      contact_phone: body.contactPhone,
      contact_email: body.contactEmail,
      partner_id: body.partnerId,
      partner_name: body.partnerName,
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
    .from('sales_crm_customers')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
