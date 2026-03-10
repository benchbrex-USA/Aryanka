import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin.from('listening_keywords').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return NextResponse.json({ keywords: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { keyword, platforms } = await req.json();
  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.from('listening_keywords').upsert({
    user_id: user.id,
    keyword: keyword.trim(),
    platforms: platforms || ['reddit', 'twitter'],
    is_active: true,
  }, { onConflict: 'user_id,keyword' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keyword: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  await admin.from('listening_keywords').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
