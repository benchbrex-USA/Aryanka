import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getResend } from '@/lib/resend/email';

// Vercel Cron: runs every hour
// Add to vercel.json:  { "path": "/api/cron/email-sequences", "schedule": "0 * * * *" }

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret — fail closed: if CRON_SECRET not set, block all requests
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io';
  const fromName = process.env.RESEND_FROM_NAME || 'Aryanka';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@aryanka.io';

  const now = new Date();

  // Find sequences due for next step
  const { data: sequences } = await admin
    .from('email_sequences')
    .select('*, leads(email, name, email_unsubscribed, email_bounced)')
    .eq('status', 'active')
    .lte('next_send_at', now.toISOString())
    .lt('current_step', 3); // max 3 steps

  if (!sequences || sequences.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const nurtureCopy: Record<number, { subject: string; heading: string; body: string }> = {
    1: {
      subject: 'How to get 500 qualified leads/month — without ads',
      heading: 'Your organic growth playbook',
      body: `Here's the framework that's working for 2,400+ companies right now:

1. Create one high-value piece of content per week
2. Syndicate it to LinkedIn, Reddit, Medium, Twitter, YouTube simultaneously
3. Capture leads with smart exit-intent forms
4. Nurture with behaviorally-triggered emails

The compound effect kicks in after 60 days. Most teams see 3-5x traffic growth by month 3.

Inside Aryanka, you can do all of this from one dashboard — without writing code.`,
    },
    2: {
      subject: '3 content syndication mistakes killing your organic reach',
      heading: 'Common mistakes (and how to fix them)',
      body: `Most teams syndicate content wrong. Here's what kills reach:

❌ Mistake 1: Posting the same text on every platform
Each platform has its own format and audience. LinkedIn wants insights. Reddit wants genuine value. Twitter wants threads. Aryanka auto-adapts your content for each.

❌ Mistake 2: Posting once and moving on
You need 12-16 touchpoints before a lead converts. Syndication gives you more surface area, but you need to stay consistent.

❌ Mistake 3: No lead capture on landing pages
Traffic without capture is just vanity. Make sure every page has a form, exit-intent popup, or inline CTA.

Fix these three things and your conversion rate will jump immediately.`,
    },
    3: {
      subject: 'Case study: 24x traffic growth in 90 days (zero ad spend)',
      heading: 'How DataPilot went from 200 to 4,800 visitors/month',
      body: `DataPilot, a B2B SaaS startup, replaced their $3,000/month MarTech stack with Aryanka.

Here's exactly what happened:

Month 1: Set up blog, connected 5 platforms, published 8 posts
Month 2: 1,200 organic visitors, 47 qualified leads captured
Month 3: 4,800 visitors, 180 leads, 12 demo calls booked

They closed ₹18L in ARR from leads that came in organically.

No paid ads. No agency. Just Aryanka running in the background.

Ready to start your own story? Your dashboard is waiting.`,
    },
  };

  let processed = 0;

  await Promise.allSettled(
    sequences.map(async (seq) => {
      const lead = seq.leads as { email: string; name: string; email_unsubscribed: boolean; email_bounced: boolean } | null;
      if (!lead || lead.email_unsubscribed || lead.email_bounced) {
        await admin.from('email_sequences').update({ status: 'completed' }).eq('id', seq.id);
        return;
      }

      const step = (seq.current_step || 0) + 1;
      const copy = nurtureCopy[step];
      if (!copy) {
        await admin.from('email_sequences').update({ status: 'completed' }).eq('id', seq.id);
        return;
      }

      const unsubUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}`;
      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#00D4FF,#3B82F6);padding:2px;border-radius:12px;margin-bottom:24px;">
      <div style="background:#080808;border-radius:10px;padding:20px;">
        <span style="font-size:18px;font-weight:700;color:#fff;">Aryanka</span>
      </div>
    </div>
    <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:32px;">
      <h2 style="color:#fff;margin:0 0 20px;font-size:20px;">${copy.heading}</h2>
      <p style="color:#e5e7eb;line-height:1.8;white-space:pre-wrap;margin:0;">${copy.body}</p>
      <div style="margin-top:28px;">
        <a href="${appUrl}/dashboard" style="background:linear-gradient(135deg,#00D4FF,#3B82F6);color:#080808;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open your dashboard →</a>
      </div>
    </div>
    <p style="color:#374151;font-size:12px;text-align:center;margin-top:24px;">
      <a href="${unsubUrl}" style="color:#4b5563;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

      const { error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: lead.email,
        subject: copy.subject,
        html,
      });

      if (!error) {
        const nextSendAt = new Date();
        nextSendAt.setDate(nextSendAt.getDate() + 3); // 3-day gap between steps

        const isLast = step >= 3;
        await admin.from('email_sequences').update({
          current_step: step,
          last_sent_at: now.toISOString(),
          next_send_at: isLast ? null : nextSendAt.toISOString(),
          status: isLast ? 'completed' : 'active',
        }).eq('id', seq.id);

        processed++;
      }
    })
  );

  return NextResponse.json({ processed, total: sequences.length });
}
