import { createClient } from '@/lib/supabase/server';
import { BarChart3, Users, TrendingUp, Calendar, ArrowUpRight, Target, RefreshCw } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const supabase = createClient();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: totalLeads },
      { count: newLeads },
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
        .in('status', ['qualified', 'proposal', 'won']),
      supabase.from('demo_bookings').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return { totalLeads, newLeads, qualifiedLeads, totalDemos, recentLeads, error: null };
  } catch {
    return { totalLeads: null, newLeads: null, qualifiedLeads: null, totalDemos: null, recentLeads: null, error: 'supabase_not_configured' };
  }
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-accent-500/20 text-accent-400',
  proposal: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
};

export default async function DashboardPage() {
  const { totalLeads, newLeads, qualifiedLeads, totalDemos, recentLeads, error } = await getStats();

  const isLive = !error;

  const stats = [
    { label: 'Total Leads', value: isLive ? (totalLeads ?? 0).toLocaleString() : '—', change: isLive ? `+${newLeads ?? 0} this month` : 'Connect Supabase', icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Qualified Leads', value: isLive ? (qualifiedLeads ?? 0).toLocaleString() : '—', change: isLive ? 'Active pipeline' : 'Connect Supabase', icon: Target, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Demo Bookings', value: isLive ? (totalDemos ?? 0).toLocaleString() : '—', change: isLive ? 'All time' : 'Connect Supabase', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'New This Month', value: isLive ? (newLeads ?? 0).toLocaleString() : '—', change: isLive ? 'Last 30 days' : 'Connect Supabase', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Growth Dashboard</h1>
          <p className="text-navy-400 mt-1 text-sm">
            {isLive ? 'Live data from Supabase' : 'Add Supabase credentials in Settings to see live data'}
          </p>
        </div>
        {!isLive && (
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-medium px-3 py-2 rounded-lg hover:bg-brand-500/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Connect Supabase
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-navy-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-navy-500">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-glass rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-semibold text-white text-sm">Recent Leads</h2>
          <Link href="/dashboard/leads" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {isLive && recentLeads && recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name / Email', 'Company', 'Source', 'Score', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLeads.map((lead: Record<string, string | number>) => (
                  <tr key={lead.id as string} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white text-sm">{(lead.name as string) || 'Anonymous'}</div>
                      <div className="text-xs text-navy-500">{lead.email as string}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300">{(lead.company as string) || '—'}</td>
                    <td className="px-5 py-4 text-sm text-navy-300">{lead.source as string}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-navy-700 rounded-full">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${lead.score as number}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{lead.score as number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[lead.status as string] || 'bg-navy-700 text-navy-300'}`}>
                        {lead.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-navy-600 mx-auto mb-3" />
            <p className="text-sm text-navy-500">
              {isLive ? 'No leads yet. Share your landing page to start capturing leads.' : 'Connect Supabase to see your leads.'}
            </p>
            {isLive && (
              <Link href="/" className="text-xs text-brand-400 hover:underline mt-2 inline-block">
                View landing page →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, label: 'View Full Analytics', href: '/dashboard/analytics', color: 'brand' },
          { icon: Users, label: 'Manage All Leads', href: '/dashboard/leads', color: 'accent' },
          { icon: TrendingUp, label: 'Content Syndication', href: '/dashboard/content', color: 'purple' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/8 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
              <action.icon className="w-5 h-5 text-navy-400 group-hover:text-brand-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-white">{action.label}</span>
            <ArrowUpRight className="w-4 h-4 text-navy-500 ml-auto group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
