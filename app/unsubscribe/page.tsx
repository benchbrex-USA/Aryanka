import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string; campaign?: string };
}) {
  const { email, campaign } = searchParams;
  let message = '';
  let error = '';

  if (email) {
    try {
      const admin = createAdminClient();
      // Mark lead as unsubscribed
      await admin.from('leads').update({ email_unsubscribed: true }).eq('email', email);
      // Record unsubscribe
      await admin.from('email_unsubscribes').upsert({ email }, { onConflict: 'email' });
      // Update sequence status
      await admin.from('email_sequences').update({ status: 'unsubscribed' })
        .contains('lead_email', [email]);

      if (campaign) {
        // Optionally log the unsubscribe event against the campaign
        void admin.from('email_events').insert({ campaign_id: campaign, event_type: 'unsubscribed', email });
      }

      message = 'You have been successfully unsubscribed.';
    } catch {
      error = 'Something went wrong. Please try again or email us at hello@aryanka.io';
    }
  } else {
    error = 'Invalid unsubscribe link.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: message ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {message ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {message ? 'Unsubscribed' : 'Error'}
        </h1>
        <p className="text-white/40 mb-8">
          {message || error}
        </p>

        <Link href="/" className="text-sm" style={{ color: '#00D4FF' }}>
          ← Back to Aryanka
        </Link>
      </div>
    </div>
  );
}
