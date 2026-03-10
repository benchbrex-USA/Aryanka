import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { getResend } from '@/lib/resend/email';

const CampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  from_name: z.string().optional(),
  from_email: z.string().email().optional(),
  audience: z.enum(['all_leads', 'qualified_leads', 'new_leads']).default('all_leads'),
  scheduled_at: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute derived metrics
  const campaigns = (data || []).map((c) => ({
    ...c,
    openRate: c.sent_count > 0 ? ((c.opened_count / c.sent_count) * 100).toFixed(1) + '%' : '—',
    ctr: c.sent_count > 0 ? ((c.clicked_count / c.sent_count) * 100).toFixed(1) + '%' : '—',
  }));

  // Summary metrics
  const summary = {
    totalSent: campaigns.reduce((a, c) => a + (c.sent_count || 0), 0),
    totalOpened: campaigns.reduce((a, c) => a + (c.opened_count || 0), 0),
    totalClicked: campaigns.reduce((a, c) => a + (c.clicked_count || 0), 0),
    avgOpenRate: (() => {
      const sent = campaigns.reduce((a, c) => a + (c.sent_count || 0), 0);
      const opened = campaigns.reduce((a, c) => a + (c.opened_count || 0), 0);
      return sent > 0 ? ((opened / sent) * 100).toFixed(1) + '%' : '—';
    })(),
    avgCtr: (() => {
      const sent = campaigns.reduce((a, c) => a + (c.sent_count || 0), 0);
      const clicked = campaigns.reduce((a, c) => a + (c.clicked_count || 0), 0);
      return sent > 0 ? ((clicked / sent) * 100).toFixed(1) + '%' : '—';
    })(),
  };

  return NextResponse.json({ campaigns, summary });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Special action: send campaign now
  if (body.action === 'send' && body.id) {
    return sendCampaign(body.id, user.id);
  }

  const parsed = CampaignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_campaigns')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data }, { status: 201 });
}

async function sendCampaign(campaignId: string, userId: string) {
  const admin = createAdminClient();

  // Fetch campaign
  const { data: campaign } = await admin
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.status === 'sending' || campaign.status === 'sent') {
    return NextResponse.json({ error: 'Campaign already sent or sending' }, { status: 400 });
  }

  // Fetch audience
  let query = admin.from('leads').select('id, email, name').eq('email_unsubscribed', false).eq('email_bounced', false);
  if (campaign.audience === 'qualified_leads') query = query.eq('status', 'qualified');
  if (campaign.audience === 'new_leads') query = query.eq('status', 'new');

  const { data: leads } = await query;
  const recipients = leads || [];

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found for this audience' }, { status: 400 });
  }

  // Mark as sending
  await admin.from('email_campaigns').update({
    status: 'sending',
    recipients_count: recipients.length,
    sent_at: new Date().toISOString(),
  }).eq('id', campaignId);

  const resend = getResend();
  const fromName = campaign.from_name || process.env.RESEND_FROM_NAME || 'Aryanka';
  const fromEmail = campaign.from_email || process.env.RESEND_FROM_EMAIL || 'hello@aryanka.io';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io';

  let sentCount = 0;
  const batchSize = 50;

  // Send in batches to respect rate limits
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (lead) => {
        const unsubUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}&campaign=${campaignId}`;
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#00D4FF,#3B82F6);padding:2px;border-radius:12px;margin-bottom:32px;">
      <div style="background:#080808;border-radius:10px;padding:24px;">
        <span style="font-size:20px;font-weight:700;color:#fff;">${fromName}</span>
      </div>
    </div>
    <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:32px;">
      <p style="color:#e5e7eb;line-height:1.7;white-space:pre-wrap;margin:0;">${campaign.body}</p>
    </div>
    <div style="margin-top:32px;text-align:center;color:#4b5563;font-size:12px;">
      <p>You received this because you signed up for Aryanka updates.</p>
      <a href="${unsubUrl}" style="color:#6b7280;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

        const { error } = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: lead.email,
          subject: campaign.subject,
          html,
        });

        if (!error) {
          sentCount++;
          void admin.from('email_events').insert({
            campaign_id: campaignId,
            lead_id: lead.id,
            event_type: 'sent',
            email: lead.email,
          });
        }
      })
    );
  }

  // Mark as sent
  await admin.from('email_campaigns').update({
    status: 'sent',
    sent_count: sentCount,
  }).eq('id', campaignId);

  return NextResponse.json({ success: true, sent: sentCount, total: recipients.length });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_campaigns')
    .update(rest)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from('email_campaigns').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
