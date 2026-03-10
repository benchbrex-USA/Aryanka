import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: rules } = await admin
    .from('scoring_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ rules: rules || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, trigger_event, trigger_value, points } = await req.json();
  if (!name || !trigger_event || points === undefined) {
    return NextResponse.json({ error: 'name, trigger_event, points required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from('scoring_rules').insert({
    user_id: user.id,
    name,
    trigger_event,
    trigger_value: trigger_value || null,
    points: parseInt(points),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rule: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...updates } = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('scoring_rules')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rule: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  await admin.from('scoring_rules').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}

// Helper: apply scoring rules to a lead event (exported from lib/scoring.ts, keep here for compat)
async function applyScoreEvent(leadId: string, event: string, eventValue?: string) {
  const admin = createAdminClient();

  const { data: rules } = await admin
    .from('scoring_rules')
    .select('*')
    .eq('trigger_event', event)
    .eq('is_active', true);

  if (!rules || rules.length === 0) return;

  const matchingRules = rules.filter((r) =>
    !r.trigger_value || r.trigger_value === eventValue
  );

  if (matchingRules.length === 0) return;

  const totalDelta = matchingRules.reduce((sum: number, r: { points: number }) => sum + r.points, 0);

  const { data: lead } = await admin.from('leads').select('score').eq('id', leadId).single();
  if (!lead) return;

  const oldScore = lead.score || 0;
  const newScore = Math.max(0, Math.min(100, oldScore + totalDelta));

  await admin.from('leads').update({ score: newScore }).eq('id', leadId);
  await admin.from('lead_score_history').insert({
    lead_id: leadId,
    old_score: oldScore,
    new_score: newScore,
    delta: totalDelta,
    reason: matchingRules.map((r: { name: string; points: number }) => `${r.name} (${r.points > 0 ? '+' : ''}${r.points})`).join(', '),
  });
}
