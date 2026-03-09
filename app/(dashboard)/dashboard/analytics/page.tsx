'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const weeklyLeads = [
  { day: 'Mon', leads: 18, traffic: 420 },
  { day: 'Tue', leads: 24, traffic: 580 },
  { day: 'Wed', leads: 31, traffic: 720 },
  { day: 'Thu', leads: 22, traffic: 510 },
  { day: 'Fri', leads: 38, traffic: 890 },
  { day: 'Sat', leads: 15, traffic: 340 },
  { day: 'Sun', leads: 11, traffic: 260 },
];

const monthlyGrowth = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  leads: Math.floor(80 + i * 90 + Math.random() * 50),
  revenue: Math.floor(50000 + i * 80000 + Math.random() * 30000),
}));

const sourceData = [
  { name: 'Google Search', value: 38, color: '#3B82F6' },
  { name: 'LinkedIn', value: 24, color: '#10B981' },
  { name: 'Reddit', value: 15, color: '#F97316' },
  { name: 'Direct', value: 12, color: '#A855F7' },
  { name: 'Medium', value: 7, color: '#EAB308' },
  { name: 'Twitter/X', value: 4, color: '#EC4899' },
];

const kpis = [
  { label: 'Total Traffic (30d)', value: '28,431', change: '+34%', up: true },
  { label: 'Leads Captured', value: '1,247', change: '+18%', up: true },
  { label: 'Email Open Rate', value: '42.3%', change: '+5%', up: true },
  { label: 'Demo Conversion', value: '8.3%', change: '+2.1%', up: true },
  { label: 'Avg Lead Score', value: '74', change: '+8', up: true },
  { label: 'Revenue Pipeline', value: '₹2.8Cr', change: '+41%', up: true },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-navy-400 mt-1">Last 30 days — all organic traffic</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-glass rounded-xl p-4">
            <div className="text-xs text-navy-500 mb-1">{kpi.label}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className={`text-xs font-medium mt-1 ${kpi.up ? 'text-accent-400' : 'text-red-400'}`}>
              {kpi.up ? '↑' : '↓'} {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly traffic + leads */}
        <div className="lg:col-span-2 bg-glass rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Weekly Traffic & Leads</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyLeads} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="traffic" fill="#3B82F620" radius={[4,4,0,0]} name="Traffic" />
              <Bar dataKey="leads" fill="#3B82F6" radius={[4,4,0,0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source breakdown */}
        <div className="bg-glass rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {sourceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-navy-400">{s.name}</span>
                </div>
                <span className="text-xs font-medium text-white">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly growth */}
      <div className="bg-glass rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Monthly Growth — Leads & Revenue Pipeline</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} dot={false} name="Leads" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} name="Revenue (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
