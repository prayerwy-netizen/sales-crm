import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { snakeToCamelArray } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entityId');
  const opportunityId = searchParams.get('opportunityId');

  let query = getClient()
    .from('sales_crm_communications')
    .select('*')
    .order('created_at', { ascending: false });

  if (entityId) query = query.eq('entity_id', entityId);
  if (opportunityId) query = query.eq('opportunity_id', opportunityId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `comm-${Date.now()}`;

  const { data, error } = await getClient()
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
