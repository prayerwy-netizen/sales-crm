import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamelArray } from '@/lib/db-utils';

const TABLE = 'sales_crm_resources';

// Mock data fallback
const mockResources = [
  { id: 'p1', resourceType: 'product', name: '全案建设产品白皮书', fileType: 'PDF', fileSize: '2.4MB', updatedAt: '2026-01-20', category: '产品介绍' },
  { id: 'p2', resourceType: 'product', name: '矿山智能化解决方案手册', fileType: 'PDF', fileSize: '5.1MB', updatedAt: '2026-01-15', category: '解决方案' },
  { id: 'p3', resourceType: 'product', name: 'SaaS平台功能说明书', fileType: 'PDF', fileSize: '1.8MB', updatedAt: '2026-02-01', category: '产品介绍' },
  { id: 'p4', resourceType: 'product', name: 'MaaS服务技术架构文档', fileType: 'PDF', fileSize: '3.2MB', updatedAt: '2025-12-10', category: '技术文档' },
  { id: 'p5', resourceType: 'product', name: '产品对比分析表', fileType: 'XLSX', fileSize: '0.5MB', updatedAt: '2026-01-28', category: '竞品分析' },
  { id: 'c1', resourceType: 'case', name: '华电煤业集团智能化改造案例', customer: '华电煤业', industry: '煤矿', result: '效率提升35%', updatedAt: '2026-01-18' },
  { id: 'c2', resourceType: 'case', name: '晋能控股数字化转型案例', customer: '晋能控股', industry: '煤矿', result: '成本降低20%', updatedAt: '2026-01-10' },
  { id: 'c3', resourceType: 'case', name: '紫金矿业安全监控系统案例', customer: '紫金矿业', industry: '金属矿', result: '事故率降低60%', updatedAt: '2025-12-20' },
  { id: 'm1', resourceType: 'material', name: '2026年产品宣传册', materialType: '宣传册', format: 'PDF', updatedAt: '2026-01-25' },
  { id: 'm2', resourceType: 'material', name: '展会易拉宝设计稿', materialType: '展会物料', format: 'AI', updatedAt: '2026-01-20' },
  { id: 'm3', resourceType: 'material', name: '客户邀请函模板', materialType: '邀请函', format: 'DOCX', updatedAt: '2026-02-01' },
  { id: 'm4', resourceType: 'material', name: '社交媒体推广图集', materialType: '社交媒体', format: 'PNG', updatedAt: '2026-01-30' },
];

export async function GET(req: NextRequest) {
  const resourceType = req.nextUrl.searchParams.get('type');

  if (!isSupabaseConfigured()) {
    const filtered = resourceType
      ? mockResources.filter((r) => r.resourceType === resourceType)
      : mockResources;
    return NextResponse.json({ data: filtered });
  }

  let query = supabase!.from(TABLE).select('*').order('updated_at', { ascending: false });
  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: snakeToCamelArray(data || []) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!isSupabaseConfigured()) {
    // Local-only: return the item with a generated id
    const item = {
      id: `${body.resourceType?.[0] || 'r'}-${Date.now()}`,
      ...body,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    return NextResponse.json({ data: item }, { status: 201 });
  }

  const id = `${body.resourceType?.[0] || 'r'}-${Date.now()}`;
  const now = new Date().toISOString();

  const { data, error } = await supabase!
    .from(TABLE)
    .insert({
      id,
      resource_type: body.resourceType,
      name: body.name,
      category: body.category || null,
      file_type: body.fileType || null,
      file_size: body.fileSize || null,
      customer: body.customer || null,
      industry: body.industry || null,
      result: body.result || null,
      material_type: body.materialType || null,
      format: body.format || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
