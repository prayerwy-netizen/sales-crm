import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';

// GET: 获取单个基础客户详情 + 联系人列表
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: '未配置 Supabase' }, { status: 503 });
  }

  const { id } = await params;

  // 先查客户基本信息
  const customerRes = await supabase!
    .from('sales_crm_base_customers')
    .select('*')
    .eq('id', id)
    .single();

  if (customerRes.error) {
    return NextResponse.json(
      { error: customerRes.error.message },
      { status: 404 }
    );
  }

  // 并行查联系人和关联关系
  const [contactsRes, asDealerRes, asCustomerRes] = await Promise.all([
    supabase!
      .from('sales_crm_base_contacts')
      .select('*')
      .eq('customer_id', id)
      .order('name'),
    supabase!
      .from('sales_crm_base_relations')
      .select('*, customer:customer_id(id, name, province, customer_type)')
      .eq('dealer_id', id),
    supabase!
      .from('sales_crm_base_relations')
      .select('*, dealer:dealer_id(id, name, customer_type)')
      .eq('customer_id', id),
  ]);

  return NextResponse.json({
    customer: customerRes.data,
    contacts: snakeToCamelArray(contactsRes.data || []),
    asDealer: snakeToCamelArray(asDealerRes.data || []),
    asCustomer: snakeToCamelArray(asCustomerRes.data || []),
  });
}
