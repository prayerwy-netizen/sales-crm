import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const results: Record<string, unknown> = {
    url_prefix: url.slice(0, 30),
    has_anon_key: !!anonKey,
    has_service_key: !!serviceKey,
  };

  if (url && serviceKey) {
    const admin = createClient(url, serviceKey);
    const { data, error, count } = await admin
      .from('sales_crm_dimension_data')
      .select('dimension_key, updated_at', { count: 'exact' })
      .eq('opportunity_id', 'opp-001');
    results.admin_count = count;
    results.admin_rows = data;
    results.admin_error = error?.message;
  }

  if (url && anonKey) {
    const anon = createClient(url, anonKey);
    const { data, error, count } = await anon
      .from('sales_crm_dimension_data')
      .select('dimension_key, updated_at', { count: 'exact' })
      .eq('opportunity_id', 'opp-001');
    results.anon_count = count;
    results.anon_rows = data;
    results.anon_error = error?.message;
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
