'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }} />
              <span className="relative text-[#080808] font-black text-sm leading-none">A</span>
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">Aryanka</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 text-sm text-white/50 hover:text-white/90 transition-colors duration-200 rounded-md hover:bg-white/[0.04]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-medium text-[#080808] rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 text-white/40 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl">
            <div className="flex flex-col gap-0.5 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 px-1">
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm text-white/60 border border-white/10 rounded-lg text-center hover:border-white/20 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm font-medium text-[#080808] rounded-lg text-center"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
