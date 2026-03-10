'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, TrendingUp, Users, Target, DollarSign, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface UTMData {
  utm_source: string;
  visitors: number;
  leads: number;
  demos: number;
  conversion_rate: string;
}

interface AttributionData {
  utmSources: UTMData[];
  topCampaigns: Array<{ utm_campaign: string; leads: number; demos: number }>;
  topMediums: Array<{ utm_medium: string; leads: number }>;
  trend: Array<{ date: string; leads: number; demos: number }>;
  totals: { leads: number; demos: number; conversion_rate: string };
}

const MOCK_DATA: AttributionData = {
  utmSources: [
    { utm_source: 'linkedin', visitors: 1240, leads: 89, demos: 12, conversion_rate: '7.2%' },
    { utm_source: 'google', visitors: 890, leads: 45, demos: 8, conversion_rate: '5.1%' },
    { utm_source: 'twitter', visitors: 560, leads: 28, demos: 3, conversion_rate: '5.0%' },
    { utm_source: 'reddit', visitors: 320, leads: 19, demos: 2, conversion_rate: '5.9%' },
    { utm_source: 'email', visitors: 780, leads: 67, demos: 15, conversion_rate: '8.6%' },
    { utm_source: 'direct', visitors: 450, leads: 31, demos: 5, conversion_rate: '6.9%' },
  ],
  topCampaigns: [
    { utm_campaign: 'q1-launch', leads: 45, demos: 8 },
    { utm_campaign: 'content-series', leads: 38, demos: 5 },
    { utm_campaign: 'saas-guide', leads: 29, demos: 4 },
    { utm_campaign: 'cold-outreach', leads: 22, demos: 6 },
  ],
  topMediums: [
    { utm_medium: 'organic', leads: 120 },
    { utm_medium: 'paid', leads: 89 },
    { utm_medium: 'email', leads: 67 },
    { utm_medium: 'social', leads: 45 },
  ],
  trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    leads: Math.floor(Math.random() * 15) + 3,
    demos: Math.floor(Math.random() * 3),
  })),
  totals: { leads: 279, demos: 45, conversion_rate: '16.1%' },
};

export default function AttributionPage() {
  const [data, setData] = useState<AttributionData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [model, setModel] = useState<'first_touch' | 'last_touch' | 'linear'>('last_touch');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/attribution?days=${days}&model=${model}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
        } else {
          setData(MOCK_DATA);
        }
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days, model]);

  const exportCSV = () => {
    const rows = [
      ['Source', 'Visitors', 'Leads', 'Demos', 'Conversion Rate'],
      ...data.utmSources.map((s) => [s.utm_source, String(s.visitors), String(s.leads), String(s.demos), s.conversion_rate]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utm-attribution-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">UTM Attribution</h1>
          <p className="text-navy-400 text-sm mt-1">Full funnel: source → visitors → leads → demos → conversions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as typeof model)}
            className="h-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 focus:outline-none"
          >
            <option value="first_touch" className="bg-navy-800">First Touch</option>
            <option value="last_touch" className="bg-navy-800">Last Touch</option>
            <option value="linear" className="bg-navy-800">Linear</option>
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 focus:outline-none"
          >
            {[7, 30, 90].map((d) => <option key={d} value={d} className="bg-navy-800">Last {d} days</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => setLoading(true)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: data.totals.leads, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Demo Bookings', value: data.totals.demos, icon: Target, color: 'text-accent-400', bg: 'bg-accent-500/10' },
          { label: 'Lead→Demo Rate', value: data.totals.conversion_rate, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-navy-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>
      ) : (
        <>
          {/* Trend chart */}
          <div className="bg-glass rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-white text-sm mb-4">Leads & Demos Trend — Last {days} Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} dot={false} name="Leads" />
                <Line type="monotone" dataKey="demos" stroke="#10B981" strokeWidth={2} dot={false} name="Demos" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Source breakdown table */}
          <div className="bg-glass rounded-xl overflow-hidden mb-6">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold text-white text-sm">UTM Source Breakdown</h2>
              <p className="text-xs text-navy-500 mt-1">Attribution model: {model.replace('_', ' ')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Source', 'Leads', 'Demos', 'Conv. Rate', 'Bar'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.utmSources
                    .sort((a, b) => b.leads - a.leads)
                    .map((source) => {
                      const maxLeads = Math.max(...data.utmSources.map((s) => s.leads));
                      return (
                        <tr key={source.utm_source} className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4 font-medium text-white capitalize">{source.utm_source}</td>
                          <td className="px-5 py-4 text-brand-400 font-medium">{source.leads}</td>
                          <td className="px-5 py-4 text-accent-400 font-medium">{source.demos}</td>
                          <td className="px-5 py-4 text-purple-400 font-medium">{source.conversion_rate}</td>
                          <td className="px-5 py-4 w-32">
                            <div className="w-full h-1.5 bg-navy-700 rounded-full">
                              <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(source.leads / maxLeads) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Campaigns + Mediums */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-glass rounded-xl p-5">
              <h2 className="font-semibold text-white text-sm mb-4">Top Campaigns</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.topCampaigns} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="utm_campaign" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="leads" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Leads" />
                  <Bar dataKey="demos" fill="#10B981" radius={[0, 4, 4, 0]} name="Demos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-glass rounded-xl p-5">
              <h2 className="font-semibold text-white text-sm mb-4">Traffic Mediums</h2>
              <div className="space-y-3">
                {data.topMediums.map((m) => {
                  const maxLeads = Math.max(...data.topMediums.map((mm) => mm.leads));
                  return (
                    <div key={m.utm_medium}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-navy-300 capitalize">{m.utm_medium}</span>
                        <span className="text-sm font-medium text-white">{m.leads} leads</span>
                      </div>
                      <div className="w-full h-2 bg-navy-700 rounded-full">
                        <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${(m.leads / maxLeads) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
