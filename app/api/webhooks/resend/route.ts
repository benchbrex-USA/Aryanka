import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createHmac, timingSafeEqual } from 'crypto';

// Resend signs webhook payloads using svix HMAC-SHA256.
// Signed payload: `${svix-id}.${svix-timestamp}.${rawBody}`
// Secret is base64-encoded: strip the "whsec_" prefix, base64-decode, use as key.
async function verifyResendSignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false; // Fail closed — reject all if secret not configured

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature'); // format: "v1,base64sig"

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject replayed webhooks older than 5 minutes
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expectedSig = createHmac('sha256', secretBytes).update(signedPayload).digest('base64');

  // svix-signature may contain multiple sigs: "v1,sig1 v1,sig2"
  const signatures = svixSignature.split(' ').map((s) => s.replace(/^v1,/, ''));
  return signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig, 'base64'), Buffer.from(expectedSig, 'base64'));
    } catch {
      return false;
    }
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const verified = await verifyResendSignature(req, rawBody);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = payload.type as string;
  const data = payload.data as Record<string, unknown>;

  if (!type || !data) {
    return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Extract email address and message ID from Resend webhook payload
  const email = (data.to as string[] | string | undefined);
  const toEmail = Array.isArray(email) ? email[0] : email;
  const messageId = data.email_id as string | undefined;

  // Find which campaign this email belongs to via email_events
  const findCampaign = async (): Promise<string | null> => {
    if (!messageId) return null;
    const { data: evt } = await admin
      .from('email_events')
      .select('campaign_id')
      .eq('resend_message_id', messageId)
      .single();
    return evt?.campaign_id || null;
  };

  switch (type) {
    case 'email.opened': {
      const campaignId = await findCampaign();
      if (campaignId) {
        const { data: campaign } = await admin
          .from('email_campaigns')
          .select('opened_count')
          .eq('id', campaignId)
          .single();
        await admin
          .from('email_campaigns')
          .update({ opened_count: ((campaign?.opened_count as number) || 0) + 1 })
          .eq('id', campaignId);
      }
      if (toEmail) {
        // Update lead score (+5 for open) and email_opens counter
        const { data: leadRow } = await admin
          .from('leads')
          .select('id, score, email_opens')
          .eq('email', toEmail)
          .single();
        if (leadRow) {
          await admin.from('leads').update({
            email_opens: ((leadRow.email_opens as number) || 0) + 1,
            score: Math.min(((leadRow.score as number) || 0) + 5, 100),
          }).eq('id', leadRow.id);
        }
        void admin.from('email_events').insert({
          campaign_id: campaignId,
          event_type: 'opened',
          email: toEmail,
          resend_message_id: messageId,
        });
      }
      break;
    }

    case 'email.clicked': {
      const campaignId = await findCampaign();
      if (campaignId) {
        const { data: campaign } = await admin
          .from('email_campaigns')
          .select('clicked_count')
          .eq('id', campaignId)
          .single();
        await admin
          .from('email_campaigns')
          .update({ clicked_count: ((campaign?.clicked_count as number) || 0) + 1 })
          .eq('id', campaignId);
      }
      if (toEmail) {
        // Update lead score (+10 for click) + status to 'contacted'
        const { data: leadRow } = await admin
          .from('leads')
          .select('id, score, email_clicks, status')
          .eq('email', toEmail)
          .single();
        if (leadRow) {
          await admin.from('leads').update({
            email_clicks: ((leadRow.email_clicks as number) || 0) + 1,
            score: Math.min(((leadRow.score as number) || 0) + 10, 100),
            status: leadRow.status === 'new' ? 'contacted' : leadRow.status,
          }).eq('id', leadRow.id);
        }
        void admin.from('email_events').insert({
          campaign_id: campaignId,
          event_type: 'clicked',
          email: toEmail,
          resend_message_id: messageId,
          metadata: { url: (data.click as Record<string, string> | undefined)?.link },
        });
      }
      break;
    }

    case 'email.bounced': {
      if (toEmail) {
        await admin.from('leads').update({ email_unsubscribed: true }).eq('email', toEmail);
        void admin.from('email_events').insert({
          event_type: 'bounced',
          email: toEmail,
          resend_message_id: messageId,
        });
      }
      break;
    }

    case 'email.complained': {
      if (toEmail) {
        await admin.from('leads').update({ email_unsubscribed: true }).eq('email', toEmail);
        await admin.from('email_unsubscribes').upsert({ email: toEmail }, { onConflict: 'email' });
        void admin.from('email_events').insert({
          event_type: 'complained',
          email: toEmail,
          resend_message_id: messageId,
        });
      }
      break;
    }

    default:
      // Unknown event type — just acknowledge
      break;
  }

  return NextResponse.json({ received: true });
}
