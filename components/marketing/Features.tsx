'use client';

import { useEffect, useRef } from 'react';
import { Share2, Search, Target, Mail, BarChart3, Users } from 'lucide-react';

const features = [
  {
    icon: Share2,
    tag: 'Syndication',
    title: 'Write once. Publish everywhere.',
    description:
      'One piece of content, distributed automatically to LinkedIn, Reddit, Medium, Twitter/X, YouTube, and Instagram — all at once.',
    color: '#00D4FF',
    size: 'large',
  },
  {
    icon: Search,
    tag: 'SEO',
    title: 'Auto-generated SEO blog',
    description: 'Keyword-rich posts, schema markup, and dynamic sitemaps that rank on Google without manual effort.',
    color: '#3B82F6',
    size: 'small',
  },
  {
    icon: Target,
    tag: 'Lead Gen',
    title: 'Smart lead capture',
    description: 'High-converting forms, exit-intent pop-ups, and embedded CTAs tuned for B2B and B2C.',
    color: '#10B981',
    size: 'small',
  },
  {
    icon: Mail,
    tag: 'Email',
    title: 'Automated nurture sequences',
    description: 'Behaviorally triggered emails that warm cold leads and guide them to conversion — free up to 5K/month.',
    color: '#F59E0B',
    size: 'small',
  },
  {
    icon: BarChart3,
    tag: 'Analytics',
    title: 'Unified analytics',
    description: 'UTM tracking, source attribution, funnel conversion, and revenue analytics in one real-time dashboard.',
    color: '#8B5CF6',
    size: 'small',
  },
  {
    icon: Users,
    tag: 'CRM',
    title: 'Built-in CRM Lite',
    description: 'Pipeline management, lead scoring, and activity logging — from first touch to closed deal.',
    color: '#00D4FF',
    size: 'small',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 60);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const large = features.filter((f) => f.size === 'large');
  const small = features.filter((f) => f.size === 'small');

  return (
    <section id="features" ref={sectionRef} className="py-28 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="reveal inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
            Everything you need
          </div>
          <h2 className="reveal reveal-delay-1 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white mb-4">
            Your complete<br />
            <span className="text-gradient">growth engine</span>
          </h2>
          <p className="reveal reveal-delay-2 text-white/40 text-lg leading-relaxed font-light">
            Six powerful modules that work together to generate, capture,
            nurture, and convert leads — entirely on organic traffic.
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Large feature card (col-span-2) */}
          {large.map((feature) => (
            <div
              key={feature.title}
              className="reveal lg:col-span-2 group relative rounded-2xl p-8 border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12] cursor-default"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 40%, ${feature.color}08 0%, transparent 60%)` }} />

              {/* Icon */}
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/[0.06]"
                style={{ background: `${feature.color}12` }}>
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>

              {/* Tag */}
              <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: feature.color }}>
                {feature.tag}
              </div>

              <h3 className="text-xl font-semibold text-white mb-3 leading-snug">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>

              {/* Decorative platform pills */}
              <div className="mt-8 flex flex-wrap gap-1.5">
                {['LinkedIn', 'Reddit', 'Medium', 'Twitter', 'YouTube', 'Instagram'].map((p) => (
                  <span key={p} className="text-[10px] px-2 py-1 rounded-md border border-white/[0.06] text-white/25"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Small feature cards (col-span-3, 2x2+1 grid) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {small.map((feature, i) => (
              <div
                key={feature.title}
                className={`reveal reveal-delay-${i + 1} group relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12] cursor-default`}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${feature.color}07 0%, transparent 60%)` }} />

                {/* Icon */}
                <div className="relative w-10 h-10 rounded-lg flex items-center justify-center mb-4 border border-white/[0.06]"
                  style={{ background: `${feature.color}10` }}>
                  <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: feature.color }}>
                  {feature.tag}
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2 leading-snug">{feature.title}</h3>
                <p className="text-white/35 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
