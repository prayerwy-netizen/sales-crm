import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';
import { mockOpportunities } from '@/data/opportunities';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: mockOpportunities });
  }

  const { data, error } = await supabase!
    .from('sales_crm_opportunities')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const id = `opp-${Date.now()}`;
  const now = new Date().toISOString();

  const { data, error } = await supabase!
    .from('sales_crm_opportunities')
    .insert({
      id,
      name: body.name,
      customer_id: body.customerId,
      customer_name: body.customerName,
      partner_id: body.partnerId || null,
      partner_name: body.partnerName || null,
      product_line: body.productLine,
      sales_path: body.salesPath,
      expected_amount: body.expectedAmount || 0,
      expected_close_date: body.expectedCloseDate || null,
      competition_mode: body.competitionMode || 'competitive',
      stage: body.stage || 'lead',
      status: 'active',
      owner_id: body.ownerId || null,
      owner_name: body.ownerName || null,
      win_rate: body.winRate || 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
