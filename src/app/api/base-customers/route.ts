import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';

// GET: 查询基础客户库（支持分页、搜索、筛选）
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const search = searchParams.get('search') || '';
  const province = searchParams.get('province') || '';
  const businessType = searchParams.get('businessType') || '';
  const customerType = searchParams.get('customerType') || '';
  const grade = searchParams.get('grade') || '';

  let query = supabase!
    .from('sales_crm_base_customers')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (province) {
    query = query.eq('province', province);
  }
  if (businessType) {
    query = query.eq('business_type', businessType);
  }
  if (customerType) {
    query = query.eq('customer_type', customerType);
  }
  if (grade) {
    query = query.eq('customer_grade', grade);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('name')
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: snakeToCamelArray(data || []),
    total: count || 0,
    page,
    pageSize,
  });
}
