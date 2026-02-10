import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';
import { mockStakeholders } from '@/data/customers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    const filtered = mockStakeholders.filter((s) => s.customerId === id);
    return NextResponse.json({ data: filtered });
  }

  const { data, error } = await supabase!
    .from('sales_crm_stakeholders')
    .select('*')
    .eq('customer_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const shId = `sh-${Date.now()}`;

  const { data, error } = await supabase!
    .from('sales_crm_stakeholders')
    .insert({
      id: shId,
      customer_id: id,
      name: body.name,
      position: body.position || null,
      role: body.role,
      influence: body.influence || 0,
      relationship_strength: body.relationshipStrength || 0,
      meet_business_needs: body.meetBusinessNeeds || false,
      social_style: body.socialStyle || null,
      core_needs: body.coreNeeds || null,
      strategy: body.strategy || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
