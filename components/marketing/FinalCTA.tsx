'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const perks = [
  'Free forever plan',
  'No credit card required',
  'Setup in 5 minutes',
  'Cancel anytime',
];

export default function FinalCTA() {
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
    <section id="book-demo" ref={sectionRef} className="py-28 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.12), transparent)' }} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        {/* Label */}
        <div className="reveal inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full text-xs font-medium border"
          style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
          Get started today
        </div>

        {/* Headline */}
        <h2 className="reveal reveal-delay-1 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight tracking-tight text-white mb-5">
          Start growing
          <br />
          <span className="text-gradient">without paying for ads</span>
        </h2>

        <p className="reveal reveal-delay-2 text-white/40 text-lg font-light mb-10 max-w-xl mx-auto">
          Join 2,400+ companies that replaced their entire paid ad stack with Aryanka.
          Free to start. No sales calls needed.
        </p>

        {/* CTA buttons */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/login"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#080808] transition-all duration-200 hover:opacity-90 hover:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="mailto:demo@aryanka.io?subject=Book a Demo"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-white/60 border border-white/[0.08] hover:border-white/20 hover:text-white/90 transition-all duration-200"
          >
            Book a demo call
          </a>
        </div>

        {/* Perks */}
        <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
              <span className="text-xs text-white/30">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
