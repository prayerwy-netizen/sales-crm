import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { snakeToCamel } from '@/lib/db-utils';

const TABLE = 'sales_crm_resources';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: { id, ...body } });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.fileType !== undefined) updateData.file_type = body.fileType;
  if (body.fileSize !== undefined) updateData.file_size = body.fileSize;
  if (body.customer !== undefined) updateData.customer = body.customer;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.result !== undefined) updateData.result = body.result;
  if (body.materialType !== undefined) updateData.material_type = body.materialType;
  if (body.format !== undefined) updateData.format = body.format;

  const { data, error } = await supabase!
    .from(TABLE)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: snakeToCamel(data) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase!.from(TABLE).delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
