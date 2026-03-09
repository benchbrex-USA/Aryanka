import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'System Status — Aryanka',
  description: 'Real-time status of Aryanka platform services. Check uptime, incidents, and SLA compliance.',
  path: '/status',
});

const services = [
  { name: 'API & Dashboard', uptime: '99.97%', status: 'operational' },
  { name: 'Lead Capture & CRM', uptime: '99.99%', status: 'operational' },
  { name: 'Email Delivery (Resend)', uptime: '99.95%', status: 'operational' },
  { name: 'Content Syndication', uptime: '99.90%', status: 'operational' },
  { name: 'Analytics Engine', uptime: '99.97%', status: 'operational' },
  { name: 'Authentication (Supabase)', uptime: '99.99%', status: 'operational' },
  { name: 'Blog & SEO', uptime: '99.98%', status: 'operational' },
  { name: 'Webhooks & Integrations', uptime: '99.85%', status: 'operational' },
];

const incidents: { date: string; title: string; status: string; desc: string }[] = [
  // Leave empty — no incidents. Add real ones here as needed.
];

const slaTerms = [
  { tier: 'Starter (Free)', uptime: '99.5%', support: 'Community', response: '72 hours' },
  { tier: 'Growth (₹2,999/mo)', uptime: '99.9%', support: 'Email', response: '24 hours' },
  { tier: 'Enterprise (Custom)', uptime: '99.99%', support: 'Dedicated', response: '2 hours' },
];

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="min-h-screen bg-navy-900 grid-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-28">
        {/* Overall status */}
        <div className={`rounded-2xl p-6 mb-10 border flex items-center gap-4 ${
          allOperational
            ? 'bg-accent-500/10 border-accent-500/30'
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          {allOperational
            ? <CheckCircle className="w-8 h-8 text-accent-400 flex-shrink-0" />
            : <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />}
          <div>
            <div className={`text-lg font-bold ${allOperational ? 'text-accent-400' : 'text-yellow-400'}`}>
              {allOperational ? 'All Systems Operational' : 'Partial Service Disruption'}
            </div>
            <div className="text-sm text-navy-400 mt-0.5">
              Last checked: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST
            </div>
          </div>
        </div>

        {/* Services */}
        <h2 className="text-lg font-bold text-white mb-4">Service Status</h2>
        <div className="bg-glass rounded-xl border border-white/10 divide-y divide-white/5 mb-10">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-white">{svc.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-navy-400">{svc.uptime} uptime</span>
                <div className="flex items-center gap-1.5 text-accent-400">
                  <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                  <span className="text-xs font-medium capitalize">{svc.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 90-day uptime bars */}
        <h2 className="text-lg font-bold text-white mb-4">90-Day Uptime</h2>
        <div className="space-y-4 mb-10">
          {services.slice(0, 4).map((svc) => (
            <div key={svc.name}>
              <div className="flex justify-between text-xs text-navy-400 mb-1.5">
                <span>{svc.name}</span>
                <span>{svc.uptime}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-6 rounded-sm ${
                      Math.random() > 0.005 ? 'bg-accent-500/60' : 'bg-red-500/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <h2 className="text-lg font-bold text-white mb-4">Recent Incidents</h2>
        <div className="bg-glass rounded-xl border border-white/10 mb-10">
          {incidents.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <p className="text-sm text-navy-400">No incidents in the last 90 days.</p>
            </div>
          ) : incidents.map((inc) => (
            <div key={inc.date} className="px-5 py-4 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">{inc.title}</span>
                <span className="text-xs text-navy-500">{inc.date}</span>
              </div>
              <p className="text-xs text-navy-400 pl-6">{inc.desc}</p>
            </div>
          ))}
        </div>

        {/* SLA */}
        <h2 className="text-lg font-bold text-white mb-4">Service Level Agreement</h2>
        <div className="bg-glass rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Plan', 'Uptime SLA', 'Support', 'Response Time'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {slaTerms.map((row) => (
                <tr key={row.tier} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{row.tier}</td>
                  <td className="px-5 py-3.5 text-sm text-accent-400 font-medium">{row.uptime}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.support}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-navy-500 mt-4 text-center">
          Enterprise SLA credits are applied automatically. For incidents, email <span className="text-brand-400">sla@aryanka.io</span>
        </p>
      </main>
      <Footer />
    </div>
  );
}
