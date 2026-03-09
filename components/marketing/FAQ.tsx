'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does Aryanka drive traffic without paid ads?',
    a: 'Aryanka uses a multi-pronged organic strategy: (1) SEO-optimized blog content that ranks on Google, (2) automated syndication to LinkedIn, Reddit, Medium, Twitter/X, and YouTube, and (3) structured data/schema markup to maximize search visibility. Your content works 24/7 — no ad budget needed.',
  },
  {
    q: 'Is Aryanka suitable for B2B AND B2C?',
    a: 'Yes. Aryanka has separate lead capture flows, email templates, and scoring models optimized for both B2B (longer sales cycles, account-based nurturing) and B2C (high-volume, fast conversion). You can run both from one account.',
  },
  {
    q: 'What platforms does the content syndication support?',
    a: 'Currently: LinkedIn (articles + posts), Reddit (targeted subreddits), Medium (publications), Twitter/X (threads), and YouTube (shorts scripts + descriptions). Instagram and Product Hunt support are on our Q2 roadmap.',
  },
  {
    q: 'How does the email nurture pipeline work?',
    a: 'When a lead is captured, they\'re automatically enrolled in a behaviorally-triggered email sequence. Sequences are customizable by lead source, industry, and intent score. We use Resend for delivery — free up to 3,000 emails/month on the Starter plan.',
  },
  {
    q: 'Do I need technical knowledge to use Aryanka?',
    a: 'No. Aryanka is fully no-code for marketers. The SEO, syndication, and lead capture systems run automatically once configured. Developers can use our API for deeper integrations.',
  },
  {
    q: 'Can I connect my existing CRM (Salesforce, HubSpot)?',
    a: 'Enterprise plan includes native integrations with Salesforce, HubSpot, Pipedrive, and Zoho. Growth plan users can connect via Zapier. Our built-in CRM Lite handles the full pipeline for most teams.',
  },
  {
    q: 'What makes Aryanka different from HubSpot or Mailchimp?',
    a: 'HubSpot costs $800+/month for similar features. Mailchimp is email-only. Aryanka is purpose-built for organic growth — combining content syndication, SEO, lead capture, email, and CRM in one unified platform at a fraction of the cost.',
  },
  {
    q: 'How quickly can I expect results?',
    a: 'Most users see measurable organic traffic growth within 30-60 days of consistent content publishing. SEO results compound over time. Lead capture improvements are immediate from day 1.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-navy-300">
            Everything you need to know about Aryanka.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-glass rounded-xl border border-white/5 overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-white/5 transition-colors"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="font-medium text-white text-sm sm:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-navy-400 flex-shrink-0 transition-transform duration-200 ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-navy-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
