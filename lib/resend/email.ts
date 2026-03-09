import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder');
}

const FROM = `${process.env.RESEND_FROM_NAME || 'Aryanka'} <${process.env.RESEND_FROM_EMAIL || 'hello@aryanka.io'}>`;

export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Aryanka — Your organic growth journey starts now',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="background:#0F172A;color:#fff;font-family:Inter,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#3B82F6,#10B981);padding:2px;border-radius:16px;margin-bottom:32px;">
          <div style="background:#1E293B;border-radius:14px;padding:32px;text-align:center;">
            <h1 style="font-size:28px;font-weight:800;margin:0 0 8px;">⚡ Welcome to Aryanka</h1>
            <p style="color:#94A3B8;margin:0;">Your organic growth engine is ready.</p>
          </div>
        </div>

        <p style="color:#CBD5E1;line-height:1.7;">Hi ${name || 'there'},</p>
        <p style="color:#CBD5E1;line-height:1.7;">
          You've just joined 2,400+ founders and marketers who are growing their business
          entirely through organic traffic — no paid ads, no wasted budget.
        </p>

        <h2 style="color:#fff;font-size:18px;margin:32px 0 16px;">Your next 3 steps:</h2>
        <div style="space-y:12px;">
          <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:12px;border-left:3px solid #3B82F6;">
            <strong style="color:#fff;">1. Set up your first landing page</strong>
            <p style="color:#94A3B8;margin:4px 0 0;font-size:14px;">Use our SEO templates to rank on Google fast.</p>
          </div>
          <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:12px;border-left:3px solid #10B981;">
            <strong style="color:#fff;">2. Connect your social platforms</strong>
            <p style="color:#94A3B8;margin:4px 0 0;font-size:14px;">Sync LinkedIn, Reddit, Twitter for automatic syndication.</p>
          </div>
          <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:12px;border-left:3px solid #A855F7;">
            <strong style="color:#fff;">3. Create your first lead capture form</strong>
            <p style="color:#94A3B8;margin:4px 0 0;font-size:14px;">Start collecting leads from day 1.</p>
          </div>
        </div>

        <div style="text-align:center;margin:40px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="background:linear-gradient(135deg,#3B82F6,#10B981);color:#fff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:16px;display:inline-block;">
            Go to Your Dashboard →
          </a>
        </div>

        <p style="color:#64748B;font-size:12px;text-align:center;margin-top:40px;">
          Aryanka · Growing businesses globally from India 🇮🇳<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#64748B;">Unsubscribe</a>
        </p>
      </body>
      </html>
    `,
  });
}

export async function sendDemoConfirmationEmail(to: string, name: string, company: string, datetime: string) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Aryanka Demo is Confirmed ✓',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0F172A;color:#fff;font-family:Inter,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        <h1 style="color:#10B981;">Demo Confirmed ✓</h1>
        <p style="color:#CBD5E1;">Hi ${name},</p>
        <p style="color:#CBD5E1;">Your personalized Aryanka demo is booked! Here are the details:</p>
        <div style="background:#1E293B;border-radius:12px;padding:24px;margin:24px 0;">
          <p style="margin:0 0 8px;color:#94A3B8;font-size:14px;">COMPANY</p>
          <p style="margin:0 0 16px;color:#fff;font-weight:600;">${company}</p>
          <p style="margin:0 0 8px;color:#94A3B8;font-size:14px;">DATE & TIME</p>
          <p style="margin:0;color:#fff;font-weight:600;">${datetime}</p>
        </div>
        <p style="color:#CBD5E1;">We'll walk you through how Aryanka can help ${company} generate qualified leads without paid ads.</p>
        <p style="color:#64748B;font-size:12px;margin-top:40px;">Aryanka · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#3B82F6;">aryanka.io</a></p>
      </body>
      </html>
    `,
  });
}

export async function sendLeadNurtureEmail(
  to: string,
  name: string,
  sequenceStep: number
) {
  const resend = getResend();
  const sequences = [
    {
      subject: 'How to get 500 leads/month without paying for ads',
      body: `<p>Hi ${name},</p><p>Here's the exact strategy our top users use to generate 500+ qualified leads per month organically...</p>`,
    },
    {
      subject: '3 content syndication mistakes killing your traffic',
      body: `<p>Hi ${name},</p><p>Most teams syndicate content wrong. Here are the 3 mistakes and how to fix them...</p>`,
    },
    {
      subject: 'Case study: 24x traffic growth in 90 days',
      body: `<p>Hi ${name},</p><p>DataPilot SaaS went from 200 to 4,800 monthly visitors in 90 days. Here's exactly how...</p>`,
    },
  ];

  const seq = sequences[sequenceStep % sequences.length];

  return resend.emails.send({
    from: FROM,
    to,
    subject: seq.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0F172A;color:#fff;font-family:Inter,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
        ${seq.body}
        <div style="text-align:center;margin:32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background:#3B82F6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">
            Try Aryanka Free →
          </a>
        </div>
        <p style="color:#64748B;font-size:12px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#64748B;">Unsubscribe</a>
        </p>
      </body>
      </html>
    `,
  });
}

export { getResend as resend };
