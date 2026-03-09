import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ABTestSchema = z.object({
  name: z.string().min(1),
  page: z.string().default('/'),
  element: z.string().default('cta_button'),
  variant_a: z.record(z.unknown()),
  variant_b: z.record(z.unknown()),
});

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ab_tests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tests: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ABTestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ab_tests')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ test: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, action, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const admin = createAdminClient();

  // Special actions: track impression/conversion, declare winner
  if (action === 'impression') {
    const variant = rest.variant as 'a' | 'b';
    const col = variant === 'a' ? 'impressions_a' : 'impressions_b';
    const { data: current } = await admin.from('ab_tests').select(col).eq('id', id).single();
    const { data, error } = await admin
      .from('ab_tests')
      .update({ [col]: ((current as Record<string, number>)?.[col] || 0) + 1 })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ test: data });
  }

  if (action === 'conversion') {
    const variant = rest.variant as 'a' | 'b';
    const col = variant === 'a' ? 'conversions_a' : 'conversions_b';
    const { data: current } = await admin.from('ab_tests').select(col).eq('id', id).single();
    const { data, error } = await admin
      .from('ab_tests')
      .update({ [col]: ((current as Record<string, number>)?.[col] || 0) + 1 })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ test: data });
  }

  const { data, error } = await admin
    .from('ab_tests')
    .update(rest)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ test: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from('ab_tests').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
