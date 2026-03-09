import { generateMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/ui/button';
import { Plus, Linkedin, Globe, Twitter, Youtube, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const metadata = generateMetadata({ title: 'Content Syndication', noIndex: true });

const posts = [
  {
    title: 'How to Generate 500 B2B Leads Per Month Without Spending on Ads',
    date: '2024-01-15',
    platforms: [
      { name: 'LinkedIn', status: 'published', icon: Linkedin, color: 'text-blue-400' },
      { name: 'Reddit', status: 'published', icon: Globe, color: 'text-orange-400' },
      { name: 'Medium', status: 'published', icon: Globe, color: 'text-green-400' },
      { name: 'Twitter/X', status: 'scheduled', icon: Twitter, color: 'text-sky-400' },
      { name: 'YouTube', status: 'pending', icon: Youtube, color: 'text-red-400' },
    ],
    reach: '12,400',
    leads: 47,
  },
  {
    title: 'The Ultimate Guide to Organic Traffic for SaaS in 2024',
    date: '2024-01-10',
    platforms: [
      { name: 'LinkedIn', status: 'published', icon: Linkedin, color: 'text-blue-400' },
      { name: 'Reddit', status: 'published', icon: Globe, color: 'text-orange-400' },
      { name: 'Medium', status: 'published', icon: Globe, color: 'text-green-400' },
      { name: 'Twitter/X', status: 'published', icon: Twitter, color: 'text-sky-400' },
      { name: 'YouTube', status: 'failed', icon: Youtube, color: 'text-red-400' },
    ],
    reach: '8,900',
    leads: 31,
  },
];

const statusIcon: Record<string, { icon: typeof CheckCircle; color: string }> = {
  published: { icon: CheckCircle, color: 'text-accent-400' },
  scheduled: { icon: Clock, color: 'text-yellow-400' },
  pending: { icon: Clock, color: 'text-navy-500' },
  failed: { icon: AlertCircle, color: 'text-red-400' },
};

const platformStats = [
  { platform: 'Google Search', impressions: '142K', clicks: '8,431', ctr: '5.9%', rank: '#4.2 avg' },
  { platform: 'LinkedIn', impressions: '28K', clicks: '1,847', ctr: '6.6%', rank: 'N/A' },
  { platform: 'Reddit', impressions: '19K', clicks: '1,203', ctr: '6.3%', rank: 'N/A' },
  { platform: 'Medium', impressions: '11K', clicks: '782', ctr: '7.1%', rank: 'N/A' },
  { platform: 'Twitter/X', impressions: '34K', clicks: '892', ctr: '2.6%', rank: 'N/A' },
];

export default function ContentPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Syndication</h1>
          <p className="text-navy-400 mt-1">Distribute content across all platforms automatically</p>
        </div>
        <Button variant="gradient" size="sm">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Platform reach stats */}
      <div className="bg-glass rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Platform Performance (30 days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Platform', 'Impressions', 'Clicks', 'CTR', 'Avg. Rank'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {platformStats.map((row) => (
                <tr key={row.platform} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{row.platform}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.impressions}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.clicks}</td>
                  <td className="px-5 py-3.5 text-sm text-accent-400 font-medium">{row.ctr}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Syndicated posts */}
      <div className="space-y-4">
        <h2 className="font-semibold text-white mb-3">Syndicated Content</h2>
        {posts.map((post) => (
          <div key={post.title} className="bg-glass rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-medium text-white text-sm">{post.title}</h3>
                <p className="text-xs text-navy-500 mt-1">{post.date}</p>
              </div>
              <div className="flex items-center gap-4 text-right flex-shrink-0">
                <div>
                  <div className="text-sm font-bold text-white">{post.reach}</div>
                  <div className="text-xs text-navy-500">Total reach</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-accent-400">{post.leads}</div>
                  <div className="text-xs text-navy-500">Leads</div>
                </div>
              </div>
            </div>

            {/* Platform status row */}
            <div className="flex flex-wrap gap-2">
              {post.platforms.map((p) => {
                const s = statusIcon[p.status];
                return (
                  <div key={p.name} className="flex items-center gap-1.5 bg-navy-800/50 rounded-lg px-3 py-1.5">
                    <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                    <span className="text-xs text-navy-300">{p.name}</span>
                    <s.icon className={`w-3 h-3 ${s.color}`} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
