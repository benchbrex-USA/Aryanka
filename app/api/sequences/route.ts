import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: sequences } = await admin
    .from('drip_sequences')
    .select('*, drip_sequence_steps(count), drip_enrollments(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ sequences: sequences || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Handle enroll action
  if (body.action === 'enroll') {
    const { sequence_id, lead_id, lead_email } = body;
    const admin = createAdminClient();
    const { data, error } = await admin.from('drip_enrollments').upsert({
      sequence_id,
      lead_id,
      lead_email,
      status: 'active',
      next_send_at: new Date().toISOString(),
    }, { onConflict: 'sequence_id,lead_id' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ enrollment: data });
  }

  const { name, description, trigger_type, trigger_config, steps } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: seq, error } = await admin.from('drip_sequences').insert({
    user_id: user.id,
    name,
    description,
    trigger_type: trigger_type || 'form_submitted',
    trigger_config: trigger_config || {},
    step_count: steps?.length || 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert steps
  if (steps && steps.length > 0) {
    const stepRows = steps.map((s: Record<string, unknown>, i: number) => ({
      sequence_id: seq.id,
      step_number: i,
      ...s,
    }));
    await admin.from('drip_sequence_steps').insert(stepRows);
  }

  return NextResponse.json({ sequence: seq }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, steps, ...updates } = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('drip_sequences')
    .update({ ...updates, step_count: steps?.length ?? updates.step_count })
    .eq('id', id)
    .eq('user_id', user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (steps) {
    await admin.from('drip_sequence_steps').delete().eq('sequence_id', id);
    if (steps.length > 0) {
      await admin.from('drip_sequence_steps').insert(
        steps.map((s: Record<string, unknown>, i: number) => ({ sequence_id: id, step_number: i, ...s }))
      );
    }
  }

  return NextResponse.json({ sequence: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  await admin.from('drip_sequences').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
