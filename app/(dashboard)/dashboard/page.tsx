import { generateMetadata } from '@/lib/seo/metadata';
import { BarChart3, Users, TrendingUp, Calendar, ArrowUpRight, Target } from 'lucide-react';

export const metadata = generateMetadata({ title: 'Dashboard', noIndex: true });

// In production, fetch real data from Supabase
const mockStats = [
  { label: 'Total Leads', value: '1,247', change: '+18%', icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { label: 'Organic Traffic', value: '28,431', change: '+34%', icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { label: 'Demo Bookings', value: '43', change: '+12%', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Conversion Rate', value: '8.3%', change: '+2.1%', icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

const recentLeads = [
  { name: 'Rahul Mehta', company: 'TechFlow Inc', email: 'rahul@techflow.com', score: 85, status: 'qualified', source: 'LinkedIn' },
  { name: 'Priya Sharma', company: 'DataPilot SaaS', email: 'priya@datapilot.io', score: 92, status: 'demo', source: 'Google' },
  { name: 'Vikram Patel', company: 'CloudOps Pro', email: 'vikram@cloudops.pro', score: 71, status: 'new', source: 'Reddit' },
  { name: 'Anjali Kumar', company: 'SalesRocket', email: 'anjali@salesrocket.co', score: 88, status: 'qualified', source: 'Blog' },
  { name: 'Karan Singh', company: 'Nimbly', email: 'karan@nimbly.app', score: 65, status: 'new', source: 'Twitter' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  qualified: 'bg-accent-500/20 text-accent-400',
  demo: 'bg-purple-500/20 text-purple-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
};

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Growth Dashboard</h1>
        <p className="text-navy-400 mt-1">Your organic pipeline at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => (
          <div key={stat.label} className="bg-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="w-3 h-3 text-accent-400" />
              <span className="text-accent-400 font-medium">{stat.change}</span>
              <span className="text-navy-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-glass rounded-xl overflow-hidden mb-8">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Recent Leads</h2>
          <a href="/dashboard/leads" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Company', 'Source', 'Score', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentLeads.map((lead) => (
                <tr key={lead.email} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white text-sm">{lead.name}</div>
                    <div className="text-xs text-navy-500">{lead.email}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-300">{lead.company}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{lead.source}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-navy-700 rounded-full max-w-16">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] || 'bg-navy-700 text-navy-300'}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, label: 'View Full Analytics', href: '/dashboard/analytics', color: 'brand' },
          { icon: Users, label: 'Manage All Leads', href: '/dashboard/leads', color: 'accent' },
          { icon: TrendingUp, label: 'Content Syndication', href: '/dashboard/content', color: 'purple' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="bg-glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/8 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/10 flex items-center justify-center group-hover:bg-${action.color}-500/20 transition-colors`}>
              <action.icon className={`w-5 h-5 text-${action.color}-400`} />
            </div>
            <span className="text-sm font-medium text-white">{action.label}</span>
            <ArrowUpRight className="w-4 h-4 text-navy-500 ml-auto group-hover:text-white transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
