import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';
import { mockCustomers } from '@/data/customers';

// GET: 获取客户列表
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: mockCustomers });
  }

  const { data, error } = await supabase!
    .from('sales_crm_customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

// POST: 新建客户
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const id = `cust-${Date.now()}`;

  const { data, error } = await supabase!
    .from('sales_crm_customers')
    .insert({
      id,
      name: body.name,
      mine_type: body.mineType || 'coal',
      group: body.group || null,
      region: body.region,
      tier: body.tier,
      category: body.category,
      annual_capacity: body.annualCapacity || null,
      contact_phone: body.contactPhone || null,
      contact_email: body.contactEmail || null,
      partner_id: body.partnerId || null,
      partner_name: body.partnerName || null,
      opportunity_count: 0,
      last_contact_date: null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
