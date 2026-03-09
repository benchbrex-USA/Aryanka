'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'How does Aryanka drive traffic without paid ads?',
    a: 'Aryanka uses a multi-pronged organic strategy: SEO-optimized blog content that ranks on Google, automated syndication to 6 platforms, and structured schema markup to maximize search visibility. Your content works 24/7 — no ad budget needed.',
  },
  {
    q: 'Is Aryanka suitable for B2B AND B2C?',
    a: 'Yes. Aryanka has separate lead capture flows, email templates, and scoring models optimized for both B2B (longer sales cycles, account-based nurturing) and B2C (high-volume, fast conversion). You can run both from one account.',
  },
  {
    q: 'What platforms does content syndication support?',
    a: 'LinkedIn, Reddit, Medium, Twitter/X, YouTube, and Instagram — all 6 simultaneously. Connect your accounts in Settings and Aryanka handles posting, formatting, and scheduling automatically.',
  },
  {
    q: 'How does the email nurture pipeline work?',
    a: "When a lead is captured, they're automatically enrolled in a behaviorally-triggered email sequence. Fully customizable by lead source, industry, and intent score. Powered by Resend — 5K emails/month free on the Pro plan.",
  },
  {
    q: 'Do I need technical skills to use Aryanka?',
    a: 'No. Aryanka is fully no-code for marketers. SEO, syndication, and lead capture run automatically once configured. Developers can use our API for deeper integrations.',
  },
  {
    q: "What makes Aryanka different from HubSpot?",
    a: 'HubSpot costs $800+/month for comparable features. Aryanka is purpose-built for organic growth — combining content syndication, SEO, lead capture, email nurture, and CRM in one platform at a fraction of the price. Start free.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.04), transparent)' }} />

      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-bold tracking-tight text-white mb-3">
            Questions & answers
          </h2>
          <p className="text-white/35 text-base font-light">
            Everything you need to know about Aryanka.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-200 hover:border-white/[0.1]"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <button
                className="w-full px-6 py-4 flex items-start justify-between text-left gap-4 group"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">
                  {faq.q}
                </span>
                <Plus
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-all duration-200 ${
                    openIdx === idx ? 'rotate-45 text-white/60' : 'text-white/20'
                  }`}
                />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-5 text-sm text-white/35 leading-relaxed border-t border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
