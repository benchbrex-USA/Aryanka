'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Companies growing', icon: Users },
  { value: '340%', label: 'Avg traffic growth', icon: TrendingUp },
  { value: '0₹', label: 'Ad spend required', icon: Zap },
];

interface ABConfig { cta_text?: string; cta_href?: string }

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [abVariant, setAbVariant] = useState<{ test_id: string; variant: 'a' | 'b'; config: ABConfig } | null>(null);

  useEffect(() => {
    // Fetch A/B variant for the primary CTA
    fetch('/api/ab-tests/variant?page=/&element=cta_button')
      .then((r) => r.json())
      .then((data) => {
        if (data.test_id) setAbVariant(data);
      })
      .catch(() => {}); // silently fail — show default CTA
  }, []);

  const ctaText = abVariant?.config?.cta_text || 'Sign up free';
  const ctaHref = abVariant?.config?.cta_href || '/login';

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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[60px]"
      style={{ background: '#080808' }}
    >
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="mesh-orb-1 absolute top-[-20%] left-[15%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="mesh-orb-2 absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="mesh-orb-3 absolute bottom-[0%] left-[30%] w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #080808 100%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">

        {/* Badge */}
        <div className="reveal inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.2)', color: '#00D4FF' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
          Now in public beta — join 2,400+ teams
        </div>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white mb-6">
          Grow your business
          <br />
          <span className="text-gradient">without paying</span>
          <br />
          for ads
        </h1>

        {/* Sub-headline */}
        <p className="reveal reveal-delay-2 text-[clamp(1rem,2vw,1.2rem)] text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Aryanka automates content syndication to 6 platforms, captures leads with smart forms,
          nurtures them via email, and tracks everything in one unified dashboard.
        </p>

        {/* CTA buttons */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href={ctaHref}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-[#080808] transition-all duration-200 hover:opacity-90 hover:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
            onClick={() => {
              // Track conversion for A/B test
              if (abVariant?.test_id) {
                void fetch(`/api/ab-tests?id=${abVariant.test_id}&variant=${abVariant.variant}&action=conversion`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: abVariant.test_id, action: 'conversion', variant: abVariant.variant }) });
              }
            }}
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-white/60 border border-white/[0.08] hover:border-white/20 hover:text-white/90 transition-all duration-200"
          >
            See how it works
          </Link>
        </div>

        {/* Stats bar */}
        <div className="reveal reveal-delay-4 inline-flex items-center gap-0 rounded-2xl border border-white/[0.06] overflow-hidden mb-20"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-3 px-6 py-4 relative group hover:bg-white/[0.03] transition-colors">
              {i > 0 && <div className="absolute left-0 top-3 bottom-3 w-px bg-white/[0.06]" />}
              <stat.icon className="w-4 h-4 flex-shrink-0" style={{ color: '#00D4FF' }} />
              <div className="text-left">
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="reveal reveal-delay-5 relative max-w-4xl mx-auto">
          {/* Glow behind */}
          <div className="absolute -inset-8 rounded-3xl" style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />

          {/* Window chrome */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto w-40 h-5 rounded-md text-center text-xs text-white/20 border border-white/[0.06] flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  app.aryanka.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)' }}>
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Leads This Month', value: '1,247', change: '+23%', color: '#00D4FF' },
                  { label: 'Organic Traffic', value: '28.4K', change: '+18%', color: '#3B82F6' },
                  { label: 'Conversion Rate', value: '8.3%', change: '+2.1%', color: '#10B981' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-4 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-xs text-white/30 mb-1.5">{s.label}</div>
                    <div className="text-2xl font-bold text-white mb-1" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs font-medium" style={{ color: '#10B981' }}>{s.change} this month</div>
                  </div>
                ))}
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mini chart */}
                <div className="rounded-xl p-4 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-white/30 mb-3">Lead sources</div>
                  <div className="space-y-2">
                    {[
                      { label: 'LinkedIn', pct: 38, color: '#0077B5' },
                      { label: 'Organic SEO', pct: 29, color: '#00D4FF' },
                      { label: 'Reddit', pct: 18, color: '#FF4500' },
                      { label: 'Direct', pct: 15, color: '#3B82F6' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className="text-xs text-white/40 w-16 flex-shrink-0">{s.label}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                          <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color, opacity: 0.8 }} />
                        </div>
                        <div className="text-xs text-white/30 w-7 text-right">{s.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent leads */}
                <div className="rounded-xl p-4 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-white/30 mb-3">Recent leads</div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Sarah M.', company: 'Acme Corp', score: 92 },
                      { name: 'Raj P.', company: 'TechFlow', score: 87 },
                      { name: 'Lisa K.', company: 'Venture AI', score: 74 },
                    ].map((lead) => (
                      <div key={lead.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>
                            {lead.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white/80">{lead.name}</div>
                            <div className="text-[10px] text-white/30">{lead.company}</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                          {lead.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
