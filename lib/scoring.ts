import { createAdminClient } from '@/lib/supabase/server';

export async function applyScoreEvent(leadId: string, event: string, eventValue?: string) {
  const admin = createAdminClient();

  const { data: rules } = await admin
    .from('scoring_rules')
    .select('*')
    .eq('trigger_event', event)
    .eq('is_active', true);

  if (!rules || rules.length === 0) return;

  const matchingRules = rules.filter((r: { trigger_value: string | null }) =>
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
