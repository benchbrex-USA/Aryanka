import { createAdminClient } from '@/lib/supabase/server';

export async function triggerWebhooks(userId: string, event: string, data: object) {
  const admin = createAdminClient();
  const { data: hooks } = await admin
    .from('webhooks')
    .select('id, url, secret, delivery_count')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [event]);

  if (!hooks || hooks.length === 0) return;

  const payload = { event, timestamp: new Date().toISOString(), data };

  await Promise.allSettled(
    hooks.map(async (hook) => {
      const res = await fetch(hook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Aryanka-Secret': hook.secret || '' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      await admin
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          delivery_count: (hook.delivery_count || 0) + 1,
          last_status: res?.status || 0,
        })
        .eq('id', hook.id);
    })
  );
}
