import { Resend } from 'resend';

export function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder');
}

const FROM = () => `${process.env.RESEND_FROM_NAME || 'Aryanka'} <${process.env.RESEND_FROM_EMAIL || 'hello@aryanka.io'}>`;
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io';

function baseLayout(content: string, footerExtra = '') {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Inter,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:linear-gradient(135deg,#00D4FF,#3B82F6);padding:1.5px;border-radius:12px;margin-bottom:28px;">
    <div style="background:#080808;border-radius:10px;padding:20px 24px;">
      <span style="font-size:18px;font-weight:700;color:#fff;">Aryanka</span>
    </div>
  </div>
  <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:32px;">
    ${content}
  </div>
  <div style="margin-top:24px;text-align:center;color:#374151;font-size:12px;">
    ${footerExtra}
    <p>Aryanka · Growing businesses globally 🇮🇳</p>
    <a href="${APP_URL()}/unsubscribe" style="color:#4b5563;">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM(),
    to,
    subject: 'Welcome to Aryanka — Your organic growth engine is ready',
    html: baseLayout(`
      <h1 style="color:#fff;font-size:24px;margin:0 0 16px;">Welcome${name ? `, ${name}` : ''}! 👋</h1>
      <p style="color:#9ca3af;line-height:1.7;margin:0 0 20px;">
        You've joined 2,400+ founders and marketers growing their business entirely through organic traffic — no paid ads, no wasted budget.
      </p>
      <h2 style="color:#fff;font-size:16px;margin:24px 0 16px;">Your first 3 steps:</h2>
      <div style="background:rgba(0,212,255,0.05);border-left:3px solid #00D4FF;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:12px;">
        <strong style="color:#fff;font-size:14px;">1. Connect your social platforms</strong>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px;">Sync LinkedIn, Reddit, Twitter/X, YouTube for automatic content syndication.</p>
      </div>
      <div style="background:rgba(59,130,246,0.05);border-left:3px solid #3B82F6;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:12px;">
        <strong style="color:#fff;font-size:14px;">2. Create your first lead capture form</strong>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px;">Start collecting qualified leads from day one.</p>
      </div>
      <div style="background:rgba(16,185,129,0.05);border-left:3px solid #10B981;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
        <strong style="color:#fff;font-size:14px;">3. Publish your first blog post</strong>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px;">Aryanka will auto-distribute it to all your connected platforms.</p>
      </div>
      <a href="${APP_URL()}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#3B82F6);color:#080808;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;">
        Go to Dashboard →
      </a>
    `),
  });
}

export async function sendDemoConfirmationEmail(to: string, name: string, company: string, datetime: string) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM(),
    to,
    subject: 'Your Aryanka demo is confirmed ✓',
    html: baseLayout(`
      <h1 style="color:#10B981;font-size:22px;margin:0 0 16px;">Demo confirmed ✓</h1>
      <p style="color:#9ca3af;line-height:1.7;margin:0 0 20px;">Hi ${name}, your personalized Aryanka demo is booked.</p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="margin-bottom:14px;">
          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Company</p>
          <p style="margin:4px 0 0;color:#fff;font-weight:600;">${company}</p>
        </div>
        <div>
          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Date & Time</p>
          <p style="margin:4px 0 0;color:#fff;font-weight:600;">${datetime}</p>
        </div>
      </div>
      <p style="color:#9ca3af;line-height:1.7;margin:0 0 24px;">
        We'll walk you through how Aryanka can help ${company} generate qualified leads without paid ads.
      </p>
      <a href="${APP_URL()}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#3B82F6);color:#080808;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Explore your dashboard →
      </a>
    `),
  });
}

export async function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  inviteToken: string
) {
  const resend = getResend();
  const inviteUrl = `${APP_URL()}/invite?token=${inviteToken}`;
  return resend.emails.send({
    from: FROM(),
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on Aryanka`,
    html: baseLayout(`
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px;">You've been invited</h1>
      <p style="color:#9ca3af;line-height:1.7;margin:0 0 20px;">
        <strong style="color:#fff;">${inviterName}</strong> has invited you to join
        <strong style="color:#fff;">${workspaceName}</strong> on Aryanka as a <strong style="color:#00D4FF;">${role}</strong>.
      </p>
      <p style="color:#9ca3af;line-height:1.7;margin:0 0 28px;">
        Aryanka is the all-in-one organic growth platform — content syndication, lead capture, email nurture, and CRM in one place.
      </p>
      <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#3B82F6);color:#080808;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;">
        Accept invitation →
      </a>
      <p style="color:#4b5563;font-size:12px;margin-top:20px;">
        This invite expires in 7 days. If you didn't expect this, you can safely ignore this email.
      </p>
    `),
  });
}

export async function sendLeadNurtureEmail(to: string, name: string, sequenceStep: number) {
  const resend = getResend();
  const steps = [
    {
      subject: 'How to get 500 qualified leads/month — without ads',
      heading: 'Your organic growth playbook',
      body: `Hi ${name},\n\nHere's the framework that's working for 2,400+ companies right now:\n\n1. Create one high-value piece of content per week\n2. Syndicate it to LinkedIn, Reddit, Medium, Twitter, YouTube simultaneously\n3. Capture leads with smart exit-intent forms\n4. Nurture with behaviorally-triggered emails\n\nThe compound effect kicks in after 60 days. Most teams see 3-5x traffic growth by month 3.`,
    },
    {
      subject: '3 content syndication mistakes killing your organic reach',
      heading: 'Are you making these mistakes?',
      body: `Hi ${name},\n\nMost teams syndicate content wrong. Here's what kills reach:\n\n❌ Posting the same text on every platform — each needs its own format\n❌ Posting once and moving on — you need 12-16 touchpoints\n❌ No lead capture on landing pages — traffic without capture is vanity\n\nAryanka handles all three automatically.`,
    },
    {
      subject: 'Case study: 24x traffic growth in 90 days (zero ad spend)',
      heading: 'From 200 to 4,800 visitors/month',
      body: `Hi ${name},\n\nDataPilot replaced their $3,000/month MarTech stack with Aryanka.\n\nMonth 1: Set up blog, connected 5 platforms, published 8 posts\nMonth 2: 1,200 organic visitors, 47 qualified leads\nMonth 3: 4,800 visitors, 180 leads, 12 demo calls\n\nThey closed ₹18L ARR from purely organic leads.\n\nYour dashboard is ready. Let's build your story.`,
    },
  ];

  const step = steps[sequenceStep % steps.length];
  return resend.emails.send({
    from: FROM(),
    to,
    subject: step.subject,
    html: baseLayout(`
      <h2 style="color:#fff;font-size:18px;margin:0 0 16px;">${step.heading}</h2>
      <p style="color:#9ca3af;line-height:1.8;white-space:pre-wrap;margin:0 0 24px;">${step.body}</p>
      <a href="${APP_URL()}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#3B82F6);color:#080808;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Open dashboard →
      </a>
    `),
  });
}
