'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  Mail,
  BarChart3,
  Settings,
  Share2,
  Zap,
  LogOut,
  Menu,
  X,
  BookOpen,
  Globe,
  UserPlus,
  FlaskConical,
  FormInput,
  Receipt,
  Gift,
  Calendar,
  Kanban,
  GitBranch,
  Filter,
  Rss,
  Lightbulb,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import type { WhiteLabelSettings } from '@/lib/white-label';
import { DEFAULT_BRANDING } from '@/lib/white-label';
import Image from 'next/image';

const navGroups = [
  {
    label: null,
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    ],
  },
  {
    label: 'Capture',
    items: [
      { icon: Users,     label: 'Leads & CRM', href: '/dashboard/leads' },
      { icon: Kanban,    label: 'Pipeline',     href: '/dashboard/pipeline' },
      { icon: FormInput, label: 'Forms',        href: '/dashboard/forms' },
      { icon: Filter,    label: 'Segments',     href: '/dashboard/segments' },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { icon: GitBranch, label: 'Sequences',   href: '/dashboard/sequences' },
      { icon: Mail,      label: 'Email',        href: '/dashboard/email' },
      { icon: Rss,       label: 'Subscribers',  href: '/dashboard/subscribers' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: Share2,       label: 'Syndication', href: '/dashboard/content' },
      { icon: Calendar,     label: 'Calendar',    href: '/dashboard/calendar' },
      { icon: Lightbulb,    label: 'Inspiration', href: '/dashboard/inspiration' },
      { icon: FlaskConical, label: 'A/B Tests',   href: '/dashboard/ab-tests' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart3,   label: 'Analytics',   href: '/dashboard/analytics' },
      { icon: TrendingUp,  label: 'Attribution', href: '/dashboard/analytics/attribution' },
      { icon: BookOpen,    label: 'Blog & SEO',  href: '/dashboard/blog' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Globe,    label: 'Workspaces', href: '/dashboard/workspaces' },
      { icon: UserPlus, label: 'Team',       href: '/dashboard/team' },
      { icon: Receipt,  label: 'Billing',    href: '/dashboard/billing' },
      { icon: Gift,     label: 'Referrals',  href: '/dashboard/referrals' },
      { icon: Settings, label: 'Settings',   href: '/dashboard/settings' },
    ],
  },
];

export default function Sidebar({
  user,
  branding = DEFAULT_BRANDING,
}: {
  user: User | null;
  branding?: WhiteLabelSettings;
}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const displayName  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = user?.email || 'admin@aryanka.io';
  const initials     = displayName.slice(0, 2).toUpperCase();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="h-14 flex items-center px-4 border-b border-white/[0.06] flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          {branding.logo_url ? (
            <Image
              src={branding.logo_url}
              alt={branding.company_name || 'Logo'}
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <span className="text-sm font-semibold text-[#ededed] tracking-tight">
            {branding.company_name || 'Aryanka'}
          </span>
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-2 pb-1 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#444]">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ icon: Icon, label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                      active
                        ? 'bg-brand-500/[0.12] text-brand-400'
                        : 'text-[#777] hover:text-[#ededed] hover:bg-white/[0.05]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors duration-150',
                        active ? 'text-brand-400' : 'text-[#555] group-hover:text-[#888]'
                      )}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {active && (
                      <ChevronRight className="w-3 h-3 text-brand-500/60 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User footer ──────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-2">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors duration-150 group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#ededed] truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[11px] text-[#555] truncate leading-tight">
              {displayEmail}
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#444] group-hover:text-[#777] transition-colors shrink-0" />
        </Link>

        <button
          onClick={handleSignOut}
          className="mt-1 w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-[#555] hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-3.5 left-3.5 z-50 p-2 rounded-lg bg-[#111] border border-white/[0.08] text-[#ededed] hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[220px]',
          'bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col',
          'transition-transform duration-300 ease-out will-change-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-[#0a0a0a] border-r border-white/[0.06] flex-col">
        <NavContent />
      </aside>
    </>
  );
}
