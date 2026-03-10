import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from('brand_mentions')
    .select('*')
    .eq('user_id', user.id)
    .order('found_at', { ascending: false })
    .limit(100);

  return NextResponse.json({ mentions: data || [] });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, replied } = await req.json();
  const admin = createAdminClient();
  await admin.from('brand_mentions').update({ replied }).eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
