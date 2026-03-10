import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin.from('segments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return NextResponse.json({ segments: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, filters } = await req.json();
  if (!name || !filters) return NextResponse.json({ error: 'name and filters required' }, { status: 400 });

  const admin = createAdminClient();

  // Count matching leads
  const count = await countSegmentLeads(admin, filters);

  const { data, error } = await admin.from('segments').insert({
    user_id: user.id,
    name,
    description,
    filters,
    lead_count: count,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ segment: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  await admin.from('segments').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}

// GET /api/segments/preview - count leads matching filters
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { filters } = await req.json();
  const admin = createAdminClient();
  const count = await countSegmentLeads(admin, filters);
  return NextResponse.json({ count });
}

type Filter = { field: string; op: string; value: string };

async function countSegmentLeads(admin: ReturnType<typeof import('@/lib/supabase/server').createAdminClient>, filters: Filter[]) {
  let query = admin.from('leads').select('id', { count: 'exact', head: true });

  for (const f of filters) {
    if (f.field === 'status') query = query.eq('status', f.value);
    if (f.field === 'source') query = query.eq('source', f.value);
    if (f.field === 'score_gte') query = query.gte('score', parseInt(f.value));
    if (f.field === 'score_lte') query = query.lte('score', parseInt(f.value));
    if (f.field === 'company_size') query = query.eq('company_size', f.value);
    if (f.field === 'company_industry') {
      // Escape ILIKE special characters to prevent pattern manipulation
      const escaped = f.value.replace(/[%_\\]/g, (c) => `\\${c}`);
      query = query.ilike('company_industry', `%${escaped}%`);
    }
  }

  const { count } = await query;
  return count || 0;
}
