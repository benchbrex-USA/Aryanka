import { createClient } from '@/lib/supabase/server';
import {
  Users,
  Target,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowUp,
  BarChart3,
  Zap,
  Settings,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ─── Data fetcher ───────────────────────────────────────── */
async function getStats() {
  try {
    const supabase = createClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo  = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      { count: totalLeads },
      { count: newLeads },
      { count: prevLeads },
      { count: qualifiedLeads },
      { count: totalDemos },
      { data: recentLeads },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['qualified', 'proposal', 'won']),
      supabase.from('demo_bookings').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    const monthGrowth =
      prevLeads && prevLeads > 0
        ? Math.round(((( newLeads ?? 0) - prevLeads) / prevLeads) * 100)
        : null;

    return {
      totalLeads, newLeads, qualifiedLeads, totalDemos, recentLeads,
      monthGrowth, error: null,
    };
  } catch {
    return {
      totalLeads: null, newLeads: null, qualifiedLeads: null,
      totalDemos: null, recentLeads: null, monthGrowth: null,
      error: 'supabase_not_configured',
    };
  }
}

/* ─── Status config ──────────────────────────────────────── */
const statusConfig: Record<string, { label: string; className: string }> = {
  new:       { label: 'New',       className: 'bg-brand-500/[0.12] text-brand-400 border-brand-500/20' },
  contacted: { label: 'Contacted', className: 'bg-yellow-500/[0.12] text-yellow-400 border-yellow-500/20' },
  qualified: { label: 'Qualified', className: 'bg-accent-500/[0.12] text-accent-400 border-accent-500/20' },
  proposal:  { label: 'Proposal',  className: 'bg-orange-500/[0.12] text-orange-400 border-orange-500/20' },
  won:       { label: 'Won',       className: 'bg-green-500/[0.12] text-green-400 border-green-500/20' },
  lost:      { label: 'Lost',      className: 'bg-red-500/[0.12] text-red-400 border-red-500/20' },
};

/* ─── Stat card ──────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}: {
  label:     string;
  value:     string;
  sub:       string;
  icon:      React.ElementType;
  iconColor: string;
  iconBg:    string;
  trend?:    number | null;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5 flex flex-col gap-4 hover:border-white/[0.11] transition-colors duration-200">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-[#555] tracking-wide">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>
      </div>

      <div>
        <div className="text-2xl font-semibold text-[#ededed] tracking-tight tabular-nums">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-[#555]">{sub}</span>
          {trend !== null && trend !== undefined && (
            <span className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-medium rounded px-1.5 py-0.5',
              trend >= 0
                ? 'bg-accent-500/[0.1] text-accent-400'
                : 'bg-red-500/[0.1] text-red-400'
            )}>
              <ArrowUp className={cn('w-2.5 h-2.5', trend < 0 && 'rotate-180')} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default async function DashboardPage() {
  const {
    totalLeads, newLeads, qualifiedLeads, totalDemos,
    recentLeads, monthGrowth, error,
  } = await getStats();

  const isLive = !error;

  const stats = [
    {
      label:     'Total Leads',
      value:     isLive ? (totalLeads ?? 0).toLocaleString() : '—',
      sub:       isLive ? 'All time' : 'Connect Supabase',
      icon:      Users,
      iconColor: 'text-brand-400',
      iconBg:    'bg-brand-500/[0.12]',
      trend:     null,
    },
    {
      label:     'Qualified',
      value:     isLive ? (qualifiedLeads ?? 0).toLocaleString() : '—',
      sub:       isLive ? 'Active pipeline' : 'Connect Supabase',
      icon:      Target,
      iconColor: 'text-accent-400',
      iconBg:    'bg-accent-500/[0.12]',
      trend:     null,
    },
    {
      label:     'Demo Bookings',
      value:     isLive ? (totalDemos ?? 0).toLocaleString() : '—',
      sub:       isLive ? 'All time' : 'Connect Supabase',
      icon:      Calendar,
      iconColor: 'text-purple-400',
      iconBg:    'bg-purple-500/[0.12]',
      trend:     null,
    },
    {
      label:     'New This Month',
      value:     isLive ? (newLeads ?? 0).toLocaleString() : '—',
      sub:       isLive ? 'Last 30 days' : 'Connect Supabase',
      icon:      TrendingUp,
      iconColor: 'text-yellow-400',
      iconBg:    'bg-yellow-500/[0.12]',
      trend:     isLive ? monthGrowth : null,
    },
  ];

  const quickActions = [
    {
      icon:  BarChart3,
      label: 'Analytics',
      desc:  'Traffic & conversions',
      href:  '/dashboard/analytics',
      color: 'text-brand-400',
      bg:    'bg-brand-500/[0.08]',
    },
    {
      icon:  Users,
      label: 'All Leads',
      desc:  'Manage your pipeline',
      href:  '/dashboard/leads',
      color: 'text-accent-400',
      bg:    'bg-accent-500/[0.08]',
    },
    {
      icon:  Zap,
      label: 'Syndication',
      desc:  'Distribute content',
      href:  '/dashboard/content',
      color: 'text-purple-400',
      bg:    'bg-purple-500/[0.08]',
    },
  ];

  return (
    <div className="min-h-full p-5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-[#555] mt-0.5">
            {isLive
              ? 'Live data · updates in real time'
              : 'Connect Supabase to see your live data'}
          </p>
        </div>

        {!isLive && (
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500/[0.1] border border-brand-500/[0.2] text-brand-400 hover:bg-brand-500/[0.15] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Connect Supabase
          </Link>
        )}
      </div>

      {/* ── Stats grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Recent Leads ────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Recent Leads</h2>
            <p className="text-xs text-[#555] mt-0.5">Latest sign-ups and contacts</p>
          </div>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#555] hover:text-[#ededed] transition-colors"
          >
            View all
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLive && recentLeads && recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Name / Email', 'Company', 'Source', 'Score', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#444]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead: Record<string, string | number>, i: number) => (
                  <tr
                    key={lead.id as string}
                    className={cn(
                      'transition-colors duration-150 hover:bg-white/[0.025]',
                      i !== recentLeads.length - 1 && 'border-b border-white/[0.04]'
                    )}
                  >
                    {/* Name / Email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-[#666] flex-shrink-0">
                          {((lead.name as string)?.[0] || (lead.email as string)?.[0] || 'A').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#ededed] truncate">
                            {(lead.name as string) || 'Anonymous'}
                          </div>
                          <div className="text-xs text-[#555] truncate">{lead.email as string}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5 text-sm text-[#777]">
                      {(lead.company as string) || <span className="text-[#444]">—</span>}
                    </td>

                    {/* Source */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-white/[0.04] text-[#666] border border-white/[0.06]">
                        {lead.source as string}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-[#222] rounded-full overflow-hidden">
                          <div
                            className="h-1 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                            style={{ width: `${Math.max(2, lead.score as number)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#777] tabular-nums w-5">
                          {lead.score as number}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize',
                        statusConfig[lead.status as string]?.className ?? 'bg-white/[0.05] text-[#666] border-white/[0.07]'
                      )}>
                        {statusConfig[lead.status as string]?.label ?? (lead.status as string)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#444]" />
            </div>
            <p className="text-sm font-medium text-[#555] mb-1">No leads yet</p>
            <p className="text-xs text-[#444] max-w-xs">
              {isLive
                ? 'Share your landing page or embed a form to start capturing leads.'
                : 'Connect Supabase in Settings to see your lead data here.'}
            </p>
            {isLive ? (
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                View landing page <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-[#a1a1a1] hover:text-[#ededed] transition-colors"
              >
                <Settings className="w-3 h-3" />
                Go to Settings
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#444] mb-3">
          Quick access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#111] p-4 hover:border-white/[0.11] hover:bg-[#141414] transition-all duration-150"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150', action.bg)}>
                <action.icon className={cn('w-4 h-4', action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#ededed]">{action.label}</div>
                <div className="text-xs text-[#555]">{action.desc}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#333] group-hover:text-[#666] transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
