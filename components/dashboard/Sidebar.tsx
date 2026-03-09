'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Share2,
  Zap,
  LogOut,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Users, label: 'Leads & CRM', href: '/dashboard/leads' },
  { icon: Share2, label: 'Syndication', href: '/dashboard/content' },
  { icon: Mail, label: 'Email', href: '/dashboard/email' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: BookOpen, label: 'Blog & SEO', href: '/dashboard/blog' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = user?.email || 'admin@aryanka.io';
  const initials = displayName.slice(0, 2).toUpperCase();

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Aryanka</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive(href)
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                : 'text-navy-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive(href) ? 'text-brand-400' : 'text-current')} />
            {label}
            {isActive(href) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group cursor-pointer transition-colors mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{displayName}</div>
            <div className="text-xs text-navy-500 truncate">{displayEmail}</div>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-800 border border-white/10 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-navy-950 border-r border-white/5 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-navy-950 border-r border-white/5 flex-col">
        <NavContent />
      </aside>
    </>
  );
}
