import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Pricing from '@/components/marketing/Pricing';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'Pricing — Aryanka',
  description: 'Start free and scale as you grow. Aryanka offers transparent pricing for solo founders, growing teams, and enterprises. No credit card required.',
  path: '/pricing',
  keywords: ['aryanka pricing', 'saas pricing india', 'lead generation tool pricing', 'organic growth platform cost'],
});

const faqs = [
  {
    q: 'Is the free plan really free forever?',
    a: 'Yes. The Starter plan is completely free with no credit card required. You get up to 250 leads/month, blog posting, basic analytics, and 2 platform syndication channels.',
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Absolutely. You can upgrade to Growth at any time and downgrade back to Starter if needed. Billing adjusts at the next cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, net banking, and bank transfers for Enterprise plans.',
  },
  {
    q: 'Is there a free trial for the Growth plan?',
    a: 'Yes — the Growth plan comes with a 14-day free trial. No credit card required during the trial period.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'You retain full access to your data for 30 days after cancellation. You can export everything before your account closes.',
  },
  {
    q: 'Do you offer discounts for startups or NGOs?',
    a: 'Yes. We offer a 50% discount for registered startups and NGOs. Contact us with proof of registration.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-navy-900 grid-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-8 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
          <CheckCircle className="w-4 h-4 text-brand-400" />
          <span className="text-sm text-brand-400 font-medium">No credit card required to start</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          Grow Organically,<br />
          <span className="text-gradient">Pay as You Scale</span>
        </h1>
        <p className="text-lg text-navy-300 max-w-2xl mx-auto">
          Start free. Upgrade when you need more. Cancel anytime.
          All plans include automatic SEO, lead capture, and CRM.
        </p>
      </section>

      {/* Pricing component */}
      <Pricing />

      {/* Feature comparison */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Everything in Every Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'SEO Optimized Blog', desc: 'Auto-generate sitemaps, meta tags, and keyword-rich content' },
            { title: 'Lead Capture Forms', desc: 'Customizable forms with spam protection and Supabase storage' },
            { title: 'CRM Lite', desc: 'Manage contacts, statuses, lead scores, and notes in one place' },
            { title: 'Analytics Dashboard', desc: 'Real-time charts for traffic sources, leads, and conversions' },
            { title: 'Email Sequences', desc: 'Automated nurture emails via Resend — free up to 3,000/month' },
            { title: 'Content Syndication', desc: 'Post once, distribute to LinkedIn, Twitter, Reddit, YouTube' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-glass rounded-xl p-5 border border-white/10">
              <CheckCircle className="w-5 h-5 text-accent-400 mb-3" />
              <div className="font-medium text-white text-sm mb-1">{title}</div>
              <div className="text-xs text-navy-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-glass rounded-xl p-6 border border-white/10">
              <h3 className="font-medium text-white mb-2">{q}</h3>
              <p className="text-sm text-navy-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="bg-glass rounded-2xl border border-white/10 max-w-2xl mx-auto p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-navy-400 text-sm mb-6">Talk to our team — we&apos;re happy to help you pick the right plan.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
