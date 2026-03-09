import { generateMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MailOpen, MousePointerClick, TrendingUp } from 'lucide-react';

export const metadata = generateMetadata({ title: 'Email Campaigns', noIndex: true });

const campaigns = [
  { name: 'Welcome Sequence', subscribers: 892, sent: 2847, opened: 1203, clicked: 341, status: 'active', openRate: '42.3%', ctr: '12.0%' },
  { name: 'B2B Nurture — Lead Gen', subscribers: 234, sent: 701, opened: 287, clicked: 89, status: 'active', openRate: '40.9%', ctr: '12.7%' },
  { name: 'Feature Announcement — Jan', subscribers: 1247, sent: 1247, opened: 562, clicked: 187, status: 'sent', openRate: '45.1%', ctr: '15.0%' },
  { name: 'Re-engagement Campaign', subscribers: 188, sent: 188, opened: 56, clicked: 14, status: 'paused', openRate: '29.8%', ctr: '7.4%' },
];

const metrics = [
  { icon: Mail, label: 'Total Sent', value: '4,983', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: MailOpen, label: 'Avg Open Rate', value: '42.3%', color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { icon: MousePointerClick, label: 'Avg CTR', value: '12.0%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: TrendingUp, label: 'Conversions', value: '187', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

const statusColor: Record<string, string> = {
  active: 'bg-accent-500/20 text-accent-400',
  sent: 'bg-blue-500/20 text-blue-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  draft: 'bg-navy-700 text-navy-400',
};

export default function EmailPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-navy-400 mt-1">Automated nurture sequences — powered by Resend</p>
        </div>
        <Button variant="gradient" size="sm">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Email metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-navy-500">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="bg-glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white">All Campaigns</h2>
          <span className="text-xs text-navy-500">Free tier: 3,000 emails/month via Resend</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Campaign', 'Subscribers', 'Sent', 'Open Rate', 'CTR', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((c) => (
                <tr key={c.name} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 font-medium text-white text-sm">{c.name}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{c.subscribers.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{c.sent.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-accent-400 font-medium">{c.openRate}</td>
                  <td className="px-5 py-4 text-sm text-brand-400 font-medium">{c.ctr}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
