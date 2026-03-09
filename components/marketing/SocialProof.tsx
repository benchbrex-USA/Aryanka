'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Founder, DataPilot SaaS',
    avatar: 'PS',
    rating: 5,
    text: 'Aryanka replaced our $3,000/month MarTech stack. We went from 200 to 4,800 monthly website visitors in 90 days — all organic. The lead quality is insane.',
    metric: '24x traffic growth',
  },
  {
    name: 'Rahul Mehta',
    role: 'Head of Growth, Nimbly',
    avatar: 'RM',
    rating: 5,
    text: 'The content syndication feature alone is worth everything. We publish once and it appears on LinkedIn, Reddit, and Medium automatically. Our demo requests tripled.',
    metric: '3x demo bookings',
  },
  {
    name: 'Anjali Verma',
    role: 'CEO, LeadStack AI',
    avatar: 'AV',
    rating: 5,
    text: 'I was skeptical about zero-ad growth. After 60 days with Aryanka, we have 340 qualified B2B leads in our CRM — not a single paid click. Game changer.',
    metric: '340 qualified leads',
  },
  {
    name: 'Karan Patel',
    role: 'Marketing Lead, CloudOps Pro',
    avatar: 'KP',
    rating: 5,
    text: 'The email nurture sequences convert at 12% — way above industry average. And the SEO blog auto-generator ranks our posts within 2 weeks of publishing.',
    metric: '12% email conversion',
  },
  {
    name: 'Sneha Iyer',
    role: 'Co-Founder, SalesRocket',
    avatar: 'SI',
    rating: 5,
    text: 'We closed ₹28L in ARR in our first quarter using only Aryanka. The CRM Lite + email pipeline is all we needed. No Salesforce. No HubSpot. Just Aryanka.',
    metric: '₹28L ARR in Q1',
  },
  {
    name: 'Vikram Nair',
    role: 'Product Manager, Infra.io',
    avatar: 'VN',
    rating: 5,
    text: 'Our Google rankings jumped from page 5 to page 1 for 11 keywords in 45 days. The auto-sitemap and schema injection features are pure SEO gold.',
    metric: 'Page 1 in 45 days',
  },
];

const logos = ['Google', 'LinkedIn', 'Reddit', 'Microsoft', 'Atlassian', 'Notion', 'Stripe', 'Figma'];

export default function SocialProof() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust logos */}
        <div className="text-center mb-16">
          <p className="text-sm text-navy-500 uppercase tracking-widest font-medium mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {logos.map((logo) => (
              <span key={logo} className="text-lg font-bold text-navy-300">
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Real Results,{' '}
            <span className="text-gradient">Zero Ad Spend</span>
          </h2>
          <p className="text-lg text-navy-300 max-w-xl mx-auto">
            Join 2,400+ founders and marketers growing their business organically.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/8 transition-colors"
            >
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-brand-500/40" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-navy-300 leading-relaxed flex-1">
                "{t.text}"
              </p>

              {/* Metric badge */}
              <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 rounded-full px-3 py-1 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                <span className="text-xs font-semibold text-accent-400">
                  {t.metric}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-navy-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
