import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';
import { mockPartners } from '@/data/partners';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: mockPartners });
  }

  const { data, error } = await supabase!
    .from('sales_crm_partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const id = `part-${Date.now()}`;

  const { data, error } = await supabase!
    .from('sales_crm_partners')
    .insert({
      id,
      name: body.name,
      region: body.region,
      cooperation_mode: body.cooperationMode,
      status: body.status || 'active',
      start_date: body.startDate || null,
      contact_name: body.contactName || null,
      contact_phone: body.contactPhone || null,
      contact_email: body.contactEmail || null,
      tech_capability: body.techCapability || 0,
      customer_coverage: body.customerCoverage || 0,
      historical_rating: body.historicalRating || 0,
      profit_share_ratio: body.profitShareRatio || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
