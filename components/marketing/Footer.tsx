import Link from 'next/link';
import { Twitter, Linkedin, Youtube, Github } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Status', href: '/status' },
  ],
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads & CRM', href: '/dashboard/leads' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Content', href: '/dashboard/content' },
  ],
  Company: [
    { label: 'Login', href: '/login' },
    { label: 'Sign up free', href: '/login' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socials = [
  { icon: Twitter, href: 'https://twitter.com/aryankaio', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/aryanka', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@aryanka', label: 'YouTube' },
  { icon: Github, href: 'https://github.com/aryanka', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04]" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }} />
                <span className="relative text-[#080808] font-black text-sm">A</span>
              </div>
              <span className="text-[15px] font-semibold text-white">Aryanka</span>
            </Link>
            <p className="text-[13px] text-white/25 leading-relaxed mb-6 max-w-[220px]">
              The all-in-one organic growth platform. No ads required.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-white/60 hover:border-white/[0.12] transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/30 hover:text-white/70 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">
            © {new Date().getFullYear()} Aryanka. All rights reserved.
          </p>
          <p className="text-[12px] text-white/15">
            Built in India 🇮🇳 — Growing businesses globally
          </p>
        </div>
      </div>
    </footer>
  );
}
