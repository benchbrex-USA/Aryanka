'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AnalyticsData = {
  summary: {
    totalLeads: number;
    qualifiedLeads: number;
    totalDemos: number;
    avgLeadScore: number;
    conversionRate: string;
  };
  sourceBreakdown: Record<string, number>;
  dailyLeads: { date: string; count: number }[];
};

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#A855F7', '#EAB308', '#EC4899'];

const MOCK: AnalyticsData = {
  summary: { totalLeads: 0, qualifiedLeads: 0, totalDemos: 0, avgLeadScore: 0, conversionRate: '0' },
  sourceBreakdown: {},
  dailyLeads: [],
};

const kpiLabels = [
  { key: 'totalLeads', label: 'Total Leads', suffix: '' },
  { key: 'qualifiedLeads', label: 'Qualified', suffix: '' },
  { key: 'totalDemos', label: 'Demo Bookings', suffix: '' },
  { key: 'avgLeadScore', label: 'Avg Lead Score', suffix: '/100' },
  { key: 'conversionRate', label: 'Conversion Rate', suffix: '%' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [days]);

  const sourceData = data
    ? Object.entries(data.sourceBreakdown).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    : [];

  const dailyData = data?.dailyLeads.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    leads: d.count,
  })) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-navy-400 mt-1 text-sm">Live data from your Supabase database</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={7} className="bg-navy-800">Last 7 days</option>
            <option value={30} className="bg-navy-800">Last 30 days</option>
            <option value={90} className="bg-navy-800">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {kpiLabels.map(({ key, label, suffix }) => (
              <div key={key} className="bg-glass rounded-xl p-4">
                <div className="text-xs text-navy-500 mb-1">{label}</div>
                <div className="text-xl font-bold text-white">
                  {data?.summary[key as keyof typeof data.summary] ?? 0}{suffix}
                </div>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Daily leads trend */}
            <div className="lg:col-span-2 bg-glass rounded-xl p-6">
              <h3 className="font-semibold text-white text-sm mb-4">Daily Leads — Last {days} Days</h3>
              {dailyData.length > 0 && dailyData.some((d) => d.leads > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-sm text-navy-500">No leads captured yet in this period.</p>
                </div>
              )}
            </div>

            {/* Source breakdown */}
            <div className="bg-glass rounded-xl p-6">
              <h3 className="font-semibold text-white text-sm mb-4">Traffic Sources</h3>
              {sourceData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {sourceData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {sourceData.slice(0, 5).map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="text-xs text-navy-400 capitalize">{s.name}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-sm text-navy-500">No source data yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Funnel stats */}
          <div className="bg-glass rounded-xl p-6">
            <h3 className="font-semibold text-white text-sm mb-4">Conversion Funnel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Leads', value: data?.summary.totalLeads ?? 0, color: 'bg-brand-500' },
                { label: 'Qualified', value: data?.summary.qualifiedLeads ?? 0, color: 'bg-accent-500' },
                { label: 'Demo', value: data?.summary.totalDemos ?? 0, color: 'bg-purple-500' },
                { label: 'Avg Score', value: `${data?.summary.avgLeadScore ?? 0}/100`, color: 'bg-yellow-500' },
                { label: 'Conv. Rate', value: `${data?.summary.conversionRate ?? 0}%`, color: 'bg-pink-500' },
              ].map((item) => (
                <div key={item.label} className="bg-navy-800/50 rounded-xl p-4 text-center">
                  <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
                  <div className="text-xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-navy-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
