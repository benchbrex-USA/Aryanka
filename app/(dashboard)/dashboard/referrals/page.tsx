'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Copy, Check, Users, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ReferralStats {
  ref_code: string;
  total: number;
  signed_up: number;
  converted: number;
  referrals: Array<{
    id: string;
    referee_email: string;
    status: string;
    created_at: string;
  }>;
}

export default function ReferralsPage() {
  const [stats, setStats]   = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/referrals');
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io';
  const refLink = stats ? `${appUrl}/?ref=${stats.ref_code}` : '';

  const copyLink = async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const STATUS_COLOR: Record<string, string> = {
    pending:   'text-navy-400 bg-navy-500/10',
    signed_up: 'text-brand-400 bg-brand-500/10',
    converted: 'text-accent-400 bg-accent-500/10',
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Referral Program</h1>
        <p className="text-navy-400 text-sm mt-1">
          Share Aryanka and earn rewards for every team that joins
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Referrals', value: stats?.total ?? '—', icon: Users,      color: 'text-brand-400',  bg: 'bg-brand-500/10' },
          { label: 'Signed Up',       value: stats?.signed_up ?? '—', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Converted',       value: stats?.converted ?? '—', icon: Gift,    color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-glass rounded-xl p-5 border border-white/10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-navy-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-glass rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-1">Your referral link</h2>
        <p className="text-xs text-navy-400 mb-4">
          Share this link. When someone signs up, you get credit automatically.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-navy-300 font-mono truncate">
            {loading ? 'Loading…' : refLink}
          </div>
          <button
            onClick={copyLink}
            disabled={!stats}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#080808] transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referral history */}
      <div className="bg-glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Referral history</h2>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-navy-500">Loading…</div>
        ) : !stats?.referrals?.length ? (
          <div className="py-12 text-center">
            <Gift className="w-10 h-10 text-navy-600 mx-auto mb-3" />
            <p className="text-sm text-navy-400">No referrals yet — share your link to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Email', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.referrals.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-white">{r.referee_email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLOR[r.status] || 'text-navy-400 bg-white/5'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-navy-400">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
