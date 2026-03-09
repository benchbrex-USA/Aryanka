'use client';

import { useEffect, useRef } from 'react';
import { Linkedin, Twitter, Youtube } from 'lucide-react';

// SVG icons for platforms not in lucide-react
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const platforms = [
  { name: 'LinkedIn', icon: Linkedin, color: '#0077B5', bg: 'rgba(0,119,181,0.1)', border: 'rgba(0,119,181,0.2)' },
  { name: 'Twitter / X', icon: Twitter, color: '#e7e7e7', bg: 'rgba(231,231,231,0.06)', border: 'rgba(255,255,255,0.1)' },
  { name: 'Reddit', icon: RedditIcon, color: '#FF4500', bg: 'rgba(255,69,0,0.1)', border: 'rgba(255,69,0,0.2)' },
  { name: 'YouTube', icon: Youtube, color: '#FF0000', bg: 'rgba(255,0,0,0.08)', border: 'rgba(255,0,0,0.18)' },
  { name: 'Instagram', icon: InstagramIcon, color: '#E1306C', bg: 'rgba(225,48,108,0.08)', border: 'rgba(225,48,108,0.18)' },
  { name: 'Medium', icon: MediumIcon, color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' },
];

export default function Platforms() {
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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden">
      {/* Top border */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
        <div className="reveal inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border"
          style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
          6 platforms
        </div>

        <h2 className="reveal reveal-delay-1 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white mb-4">
          Every channel.
          <br />
          <span className="text-gradient">One dashboard.</span>
        </h2>
        <p className="reveal reveal-delay-2 text-white/40 text-lg font-light mb-16 max-w-xl mx-auto">
          Connect once and Aryanka handles the distribution, formatting, and posting
          on every platform automatically.
        </p>

        {/* Platform grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {platforms.map((platform, i) => (
            <div
              key={platform.name}
              className={`reveal reveal-delay-${i + 1} group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-default`}
              style={{ background: platform.bg, borderColor: platform.border }}
            >
              <div className="relative">
                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 20px ${platform.color}40` }} />
                <div style={{ color: platform.color }}>
                  <platform.icon />
                </div>
              </div>
              <span className="text-[11px] font-medium text-white/40 group-hover:text-white/70 transition-colors">
                {platform.name}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="reveal mt-10 text-xs text-white/20">
          Connect your accounts in Settings → Syndication. Posts go out within seconds of publishing.
        </p>
      </div>
    </section>
  );
}
