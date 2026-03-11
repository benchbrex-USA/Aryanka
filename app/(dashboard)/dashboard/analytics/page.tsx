'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Loader2, RefreshCw, Users, Target, Calendar, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnalyticsData = {
  summary: {
    totalLeads: number; qualifiedLeads: number;
    totalDemos: number; avgLeadScore: number; conversionRate: string;
  };
  sourceBreakdown: Record<string, number>;
  dailyLeads: { date: string; count: number }[];
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F97316', '#A855F7', '#EAB308', '#EC4899'];

const MOCK: AnalyticsData = {
  summary: { totalLeads: 0, qualifiedLeads: 0, totalDemos: 0, avgLeadScore: 0, conversionRate: '0' },
  sourceBreakdown: {}, dailyLeads: [],
};

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#ededed',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
};

const selectCls = 'h-9 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-[#ededed] px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 hover:border-white/[0.12] transition-colors [&>option]:bg-[#1a1a1a]';

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(30);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch { setData(MOCK); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [days]);

  const sourceData = data
    ? Object.entries(data.sourceBreakdown).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
    : [];

  const dailyData = data?.dailyLeads.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    leads: d.count,
  })) ?? [];

  const kpis = [
    { key: 'totalLeads',      label: 'Total Leads',     suffix: '',     icon: Users,      color: 'text-brand-400',  bg: 'bg-brand-500/[0.12]' },
    { key: 'qualifiedLeads',  label: 'Qualified',        suffix: '',     icon: Target,     color: 'text-accent-400', bg: 'bg-accent-500/[0.12]' },
    { key: 'totalDemos',      label: 'Demo Bookings',   suffix: '',     icon: Calendar,   color: 'text-purple-400', bg: 'bg-purple-500/[0.12]' },
    { key: 'avgLeadScore',    label: 'Avg Lead Score',  suffix: '/100', icon: Star,       color: 'text-yellow-400', bg: 'bg-yellow-500/[0.12]' },
    { key: 'conversionRate',  label: 'Conversion Rate', suffix: '%',    icon: TrendingUp, color: 'text-pink-400',   bg: 'bg-pink-500/[0.12]' },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">Analytics</h1>
          <p className="text-xs text-[#555] mt-0.5">Live data from your Supabase database</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectCls} style={{ width: 'auto' }}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="secondary" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── KPI grid ─────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map(({ key, label, suffix, icon: Icon, color, bg }) => (
              <div key={key} className="rounded-xl border border-white/[0.07] bg-[#111] p-4 hover:border-white/[0.11] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#555] font-medium">{label}</span>
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', bg)}>
                    <Icon className={cn('w-3.5 h-3.5', color)} />
                  </div>
                </div>
                <div className="text-xl font-semibold text-[#ededed] tabular-nums tracking-tight">
                  {data?.summary[key as keyof typeof data.summary] ?? 0}{suffix}
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts row ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Daily leads */}
            <div className="lg:col-span-2 rounded-xl border border-white/[0.07] bg-[#111] p-5">
              <h3 className="text-sm font-semibold text-[#ededed] mb-4">Daily Leads — Last {days} days</h3>
              {dailyData.length > 0 && dailyData.some((d) => d.leads > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData} barSize={6}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-8 h-8 text-[#333] mb-2" />
                  <p className="text-sm text-[#555]">No leads captured in this period.</p>
                </div>
              )}
            </div>

            {/* Source breakdown */}
            <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
              <h3 className="text-sm font-semibold text-[#ededed] mb-4">Traffic Sources</h3>
              {sourceData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                        {sourceData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {sourceData.slice(0, 5).map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="text-xs text-[#777] capitalize">{s.name}</span>
                        </div>
                        <span className="text-xs font-medium text-[#ededed] tabular-nums">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-[#555]">No source data yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Conversion funnel ────────────────────────── */}
          <div className="rounded-xl border border-white/[0.07] bg-[#111] p-5">
            <h3 className="text-sm font-semibold text-[#ededed] mb-4">Conversion Funnel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total Leads', value: data?.summary.totalLeads ?? 0,                 pct: 100,   color: '#3B82F6' },
                { label: 'Qualified',   value: data?.summary.qualifiedLeads ?? 0,             pct: data?.summary.totalLeads ? Math.round((data.summary.qualifiedLeads / data.summary.totalLeads) * 100) : 0, color: '#10B981' },
                { label: 'Demo',        value: data?.summary.totalDemos ?? 0,                 pct: data?.summary.totalLeads ? Math.round((data.summary.totalDemos / data.summary.totalLeads) * 100) : 0, color: '#A855F7' },
                { label: 'Avg Score',   value: `${data?.summary.avgLeadScore ?? 0}/100`,      pct: data?.summary.avgLeadScore ?? 0, color: '#EAB308' },
                { label: 'Conv. Rate',  value: `${data?.summary.conversionRate ?? 0}%`,       pct: parseFloat(data?.summary.conversionRate ?? '0'), color: '#EC4899' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.05] text-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                  <div className="text-xl font-semibold text-[#ededed] tabular-nums">{item.value}</div>
                  <div className="text-xs text-[#555]">{item.label}</div>
                  <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${Math.min(100, item.pct)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
