import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Immediately enrolls a lead in the email nurture sequence.
 * Called synchronously when a lead is captured (don't wait for cron).
 * First email fires 15 minutes after signup.
 * Idempotent — safe to call multiple times for the same lead.
 */
export async function enrollLeadInSequence(
  supabase: SupabaseClient,
  leadId: string,
  email: string
): Promise<void> {
  try {
    // Check if already enrolled
    const { data: existing } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('lead_id', leadId)
      .maybeSingle();

    if (existing) return;

    // First email in 15 minutes
    const nextSendAt = new Date(Date.now() + 15 * 60 * 1000);

    await supabase.from('email_sequences').insert({
      lead_id: leadId,
      lead_email: email,
      status: 'active',
      current_step: 0,
      next_send_at: nextSendAt.toISOString(),
    });
  } catch {
    // Non-critical — cron will pick it up if this fails
  }
}
