import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';
import { mockCommunicationRecords as mockRecords } from '@/data/opportunities';

// GET: 获取沟通记录列表（支持按 entityId / opportunityId 筛选）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entityId');
  const opportunityId = searchParams.get('opportunityId');

  if (!isSupabaseConfigured()) {
    let filtered = mockRecords;
    if (entityId) filtered = filtered.filter((r) => r.entityId === entityId);
    if (opportunityId) filtered = filtered.filter((r) => r.opportunityId === opportunityId);
    return NextResponse.json({ data: filtered });
  }

  let query = supabase!
    .from('sales_crm_communications')
    .select('*')
    .order('created_at', { ascending: false });

  if (entityId) query = query.eq('entity_id', entityId);
  if (opportunityId) query = query.eq('opportunity_id', opportunityId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

// POST: 新建沟通记录
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const body = await req.json();
  const id = `comm-${Date.now()}`;

  const { data, error } = await supabase!
    .from('sales_crm_communications')
    .insert({
      id,
      entity_type: body.entityType,
      entity_id: body.entityId,
      entity_name: body.entityName || null,
      opportunity_id: body.opportunityId || null,
      method: body.method,
      content: body.content,
      participants: body.participants || [],
      next_follow_up: body.nextFollowUp || null,
      created_at: new Date().toISOString(),
      created_by: body.createdBy || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
