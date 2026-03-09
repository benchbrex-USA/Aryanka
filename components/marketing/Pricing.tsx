'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'For solopreneurs and early-stage startups exploring organic growth.',
    cta: 'Start for free',
    href: '/login',
    popular: false,
    features: [
      '1 website / domain',
      'Up to 250 leads / month',
      'SEO blog — 5 posts / month',
      'Email nurture — 500 / month',
      'Basic analytics dashboard',
      '2 platform syndication',
      'CRM Lite — up to 100 contacts',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 2999, annual: 1999 },
    description: 'For growing B2B & B2C teams serious about building an organic pipeline.',
    cta: 'Start free trial',
    href: '/login?plan=pro',
    popular: true,
    features: [
      '5 websites / domains',
      'Unlimited lead capture',
      'SEO blog — unlimited posts',
      'Email nurture — 5K / month',
      'Advanced analytics + UTM attribution',
      'All 6 platform syndication',
      'CRM Lite — unlimited contacts',
      'Exit-intent pop-ups',
      'A/B testing for CTAs',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'Custom solutions for large teams, agencies, and enterprise accounts.',
    cta: 'Talk to sales',
    href: 'mailto:sales@aryanka.io',
    popular: false,
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Custom integrations (CRM, Slack)',
      'White-label option',
      'SLA & uptime guarantee',
      'Custom email domain',
      'Advanced AI lead scoring',
      'Team collaboration + roles',
      'SSO / SAML',
      'Invoice billing',
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-28 relative overflow-hidden">
      {/* Ambient glow behind pro card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 65%)' }} />

      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.12), transparent)' }} />

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
            Pricing
          </div>
          <h2 className="reveal reveal-delay-1 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="reveal reveal-delay-2 text-white/40 text-lg font-light mb-8">
            Start free. Scale when you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="reveal reveal-delay-3 inline-flex items-center gap-0 rounded-xl border border-white/[0.06] p-1"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !annual ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Annual
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`reveal reveal-delay-${idx + 1} relative rounded-2xl p-8 border transition-all duration-300 flex flex-col ${
                plan.popular
                  ? 'border-[rgba(0,212,255,0.3)] scale-[1.02] md:scale-[1.04]'
                  : 'border-white/[0.06] hover:border-white/[0.1]'
              }`}
              style={{
                background: plan.popular
                  ? 'linear-gradient(180deg, rgba(0,212,255,0.06) 0%, rgba(59,130,246,0.04) 100%)'
                  : 'rgba(255,255,255,0.02)',
                ...(plan.popular ? { boxShadow: '0 0 60px rgba(0,212,255,0.08), 0 0 120px rgba(0,212,255,0.04)' } : {}),
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-4 py-1 rounded-full text-[#080808]"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
                  Most popular
                </div>
              )}

              {/* Plan name */}
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: plan.popular ? '#00D4FF' : 'rgba(255,255,255,0.3)' }}>
                  {plan.name}
                </div>
                <div className="mb-3">
                  {plan.price.monthly === null ? (
                    <div className="text-4xl font-bold text-white">Custom</div>
                  ) : plan.price.monthly === 0 ? (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">Free</span>
                      <span className="text-white/30 text-sm mb-1">forever</span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-white/30 text-sm mb-1">₹</span>
                      <span className="text-4xl font-bold text-white">
                        {annual ? plan.price.annual : plan.price.monthly}
                      </span>
                      <span className="text-white/30 text-sm mb-1">/ mo</span>
                    </div>
                  )}
                  {annual && plan.price.monthly !== null && plan.price.monthly > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                      Billed ₹{((plan.price.annual ?? 0) * 12).toLocaleString()} / year
                    </p>
                  )}
                </div>
                <p className="text-white/35 text-sm leading-relaxed">{plan.description}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200 mb-8 block hover:opacity-90 hover:scale-[0.98] ${
                  plan.popular
                    ? 'text-[#080808]'
                    : 'text-white border border-white/[0.1] hover:border-white/[0.2]'
                }`}
                style={plan.popular
                  ? { background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }
                  : { background: 'rgba(255,255,255,0.04)' }
                }
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: plan.popular ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                      }}>
                      <Check className="w-2.5 h-2.5" style={{ color: plan.popular ? '#00D4FF' : 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <span className="text-sm text-white/50 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="reveal text-center text-xs text-white/20 mt-8">
          All plans include SSL, CDN, automatic updates. No credit card required for free plan.
        </p>
      </div>
    </section>
  );
}
