import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('workspace_members')
    .select('id, invited_email, role, status, workspaces(name)')
    .eq('invite_token', token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  if (data.status === 'accepted') return NextResponse.json({ error: 'This invite has already been accepted' }, { status: 400 });

  const wsRaw = data.workspaces as { name: string } | { name: string }[] | null;
  const ws = Array.isArray(wsRaw) ? wsRaw[0] : wsRaw;

  return NextResponse.json({
    invite: {
      workspace_name: ws?.name || 'Unknown workspace',
      invited_email: data.invited_email,
      role: data.role,
      status: data.status,
    },
  });
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'You must be logged in to accept an invite' }, { status: 401 });

  const admin = createAdminClient();

  const { data: member, error } = await admin
    .from('workspace_members')
    .select('id, status, invited_email, workspace_id')
    .eq('invite_token', token)
    .single();

  if (error || !member) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  if (member.status === 'accepted') return NextResponse.json({ error: 'Invite already accepted' }, { status: 400 });

  // Accept the invite — link this user to the member record
  const { error: updateErr } = await admin
    .from('workspace_members')
    .update({
      user_id: user.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', member.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true, workspace_id: member.workspace_id });
}
