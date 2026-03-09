'use client';

import { useEffect, useRef } from 'react';

const testimonials = [
  {
    quote: 'Aryanka replaced our $3,000/month MarTech stack. We went from 200 to 4,800 monthly visitors in 90 days — purely organic. The lead quality is insane.',
    name: 'Priya Sharma',
    role: 'Founder, DataPilot SaaS',
    avatar: 'PS',
    metric: '24× traffic growth',
    metricColor: '#00D4FF',
  },
  {
    quote: 'The content syndication alone is worth it. Publish once, appears on LinkedIn, Reddit, and Medium automatically. Our demo requests tripled in 30 days.',
    name: 'Rahul Mehta',
    role: 'Head of Growth, Nimbly',
    avatar: 'RM',
    metric: '3× demo bookings',
    metricColor: '#10B981',
  },
  {
    quote: 'I closed ₹28L ARR in Q1 using only Aryanka. The CRM + email pipeline is everything we needed. No Salesforce. No HubSpot. Just this.',
    name: 'Anjali Verma',
    role: 'CEO, LeadStack AI',
    avatar: 'AV',
    metric: '₹28L ARR in Q1',
    metricColor: '#3B82F6',
  },
];

export default function Testimonials() {
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
    <section ref={sectionRef} className="py-28 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
            Real results
          </div>
          <h2 className="reveal reveal-delay-1 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white mb-4">
            Teams that made the switch
          </h2>
          <p className="reveal reveal-delay-2 text-white/40 text-lg font-light">
            2,400+ companies growing without a single rupee in paid ads.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`reveal reveal-delay-${i + 1} group relative rounded-2xl p-7 border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.1] flex flex-col`}
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 20%, ${t.metricColor}05 0%, transparent 60%)` }} />

              {/* Quote mark */}
              <div className="text-5xl leading-none font-serif mb-4 select-none" style={{ color: `${t.metricColor}30` }}>"</div>

              <p className="text-white/60 text-sm leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>

              {/* Metric */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mb-6 w-fit"
                style={{ background: `${t.metricColor}10`, color: t.metricColor }}>
                ↑ {t.metric}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${t.metricColor}15`, color: t.metricColor }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/30">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
