import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const InviteSchema = z.object({
  workspace_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspace_id = searchParams.get('workspace_id');

  const admin = createAdminClient();
  let query = admin
    .from('workspace_members')
    .select('*, workspaces(name, owner_id)')
    .order('invited_at', { ascending: false });

  if (workspace_id) {
    query = query.eq('workspace_id', workspace_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();

  // Verify caller owns the workspace
  const { data: ws } = await admin
    .from('workspaces')
    .select('id, name')
    .eq('id', parsed.data.workspace_id)
    .eq('owner_id', user.id)
    .single();

  if (!ws) return NextResponse.json({ error: 'Workspace not found or unauthorized' }, { status: 403 });

  const { data, error } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: parsed.data.workspace_id,
      invited_email: parsed.data.email,
      role: parsed.data.role,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO: Send invite email via Resend
  // await sendTeamInviteEmail(parsed.data.email, ws.name, data.invite_token);

  return NextResponse.json({ member: data, invite_token: data.invite_token }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { member_id } = await req.json();
  if (!member_id) return NextResponse.json({ error: 'member_id required' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('workspace_members')
    .delete()
    .eq('id', member_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
