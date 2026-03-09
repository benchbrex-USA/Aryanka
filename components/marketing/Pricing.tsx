'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Zap, Star, Building2 } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for solopreneurs and early-stage startups.',
    cta: 'Get Started Free',
    href: '/signup',
    popular: false,
    features: [
      '1 website / domain',
      'Up to 250 leads/month',
      'SEO blog (5 posts/month)',
      'Email nurture (500 emails/month)',
      'Basic analytics dashboard',
      '2 platform syndication',
      'CRM Lite (up to 100 contacts)',
    ],
  },
  {
    name: 'Growth',
    icon: Star,
    price: { monthly: 2999, annual: 1999 },
    description: 'For growing B2B/B2C teams serious about organic growth.',
    cta: 'Start Free Trial',
    href: '/signup?plan=growth',
    popular: true,
    features: [
      '5 websites / domains',
      'Unlimited lead capture',
      'SEO blog (unlimited posts)',
      'Email nurture (5K emails/month)',
      'Advanced analytics + attribution',
      'All 6 platform syndication',
      'CRM Lite (unlimited contacts)',
      'Exit-intent pop-ups',
      'A/B testing for CTAs',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: { monthly: null, annual: null },
    description: 'Custom solutions for large teams and agencies.',
    cta: 'Book a Demo',
    href: '#book-demo',
    popular: false,
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Custom integrations (CRM, Slack)',
      'White-label option',
      'SLA & uptime guarantee',
      'Custom email domain',
      'Advanced lead scoring AI',
      'Team collaboration tools',
      'SSO / SAML',
      'Invoice billing',
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple,{' '}
            <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-navy-300 max-w-xl mx-auto mb-8">
            Start free. Scale when you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-navy-800 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-white text-navy-900' : 'text-navy-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? 'bg-white text-navy-900' : 'text-navy-400 hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs bg-accent-500 text-white px-1.5 py-0.5 rounded-full">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-brand-500/20 to-navy-800/50 border-brand-500/50 shadow-2xl shadow-brand-500/20 scale-105'
                  : 'bg-glass border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-brand-500' : 'bg-white/10'}`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{plan.name}</div>
                  <div className="text-xs text-navy-400">{plan.description}</div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly === null ? (
                  <div className="text-3xl font-bold text-white">Custom</div>
                ) : plan.price.monthly === 0 ? (
                  <div className="text-3xl font-bold text-white">
                    Free
                    <span className="text-sm font-normal text-navy-400 ml-2">forever</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-navy-400">₹</span>
                    <span className="text-4xl font-bold text-white">
                      {annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-sm text-navy-400 mb-1">/month</span>
                  </div>
                )}
                {annual && plan.price.monthly !== null && plan.price.monthly > 0 && (
                  <p className="text-xs text-accent-400 mt-1">
                    Billed ₹{(plan.price.annual! * 12).toLocaleString()}/year
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                variant={plan.popular ? 'gradient' : 'outline'}
                size="lg"
                className="w-full mb-8"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-brand-500' : 'bg-white/10'}`}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-sm text-navy-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-navy-500 mt-8">
          All plans include SSL, CDN, and automatic updates. No credit card required for free plan.
        </p>
      </div>
    </section>
  );
}
