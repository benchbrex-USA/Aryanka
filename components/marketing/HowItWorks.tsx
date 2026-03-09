'use client';

import { useEffect, useRef } from 'react';
import { PenLine, Share2, TrendingUp } from 'lucide-react';

const steps = [
  {
    n: '01',
    icon: PenLine,
    title: 'Create once',
    description:
      'Write a single high-value piece of content inside Aryanka\'s editor — SEO recommendations built in. No extra tools needed.',
    color: '#00D4FF',
  },
  {
    n: '02',
    icon: Share2,
    title: 'Syndicate everywhere',
    description:
      'Aryanka automatically repurposes and distributes your content to all 6 platforms simultaneously, driving inbound from every channel.',
    color: '#3B82F6',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Convert & close',
    description:
      'Smart lead capture, AI scoring, automated nurture emails, and CRM tracking — from first visit to signed deal.',
    color: '#10B981',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-28 relative overflow-hidden">
      {/* Subtle section divider glow */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.15), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="reveal inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
            Three steps
          </div>
          <h2 className="reveal reveal-delay-1 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white mb-4">
            From zero to full pipeline<br />
            <span className="text-gradient">in one afternoon</span>
          </h2>
          <p className="reveal reveal-delay-2 text-white/40 text-lg font-light">
            Aryanka replaces six different tools with one seamless workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[calc(16.66%-20px)] right-[calc(16.66%-20px)] h-px line-pulse"
            style={{ background: 'linear-gradient(to right, #00D4FF30, #3B82F630, #10B98130)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={`reveal reveal-delay-${i + 1} group relative`}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center lg:items-start mb-6">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl border mb-4 transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `${step.color}0d`,
                      borderColor: `${step.color}25`,
                    }}>
                    {/* Glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: `0 0 24px ${step.color}25` }} />
                    <step.icon className="w-6 h-6 relative z-10" style={{ color: step.color }} />
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center"
                      style={{ background: '#080808', borderColor: `${step.color}40`, color: step.color }}>
                      {i + 1}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center lg:text-left">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: step.color }}>
                    Step {step.n}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA nudge */}
        <div className="reveal mt-20 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#00D4FF' }}
          >
            Start your free account — no credit card required
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
