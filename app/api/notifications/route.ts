import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET /api/notifications — returns recent notifications for current user
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const unreadCount = (data || []).filter((n) => !n.read).length;
  return NextResponse.json({ notifications: data || [], unreadCount });
}

// PUT /api/notifications — mark as read
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const admin = createAdminClient();

  if (body.markAllRead) {
    await admin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    await admin
      .from('notifications')
      .update({ read: true })
      .eq('id', body.id)
      .eq('user_id', user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'id or markAllRead required' }, { status: 400 });
}
