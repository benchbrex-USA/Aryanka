'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Shield, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';

interface DelivStats {
  bounce_rate: number;
  spam_rate: number;
  unsub_rate: number;
  open_rate: number;
  total_sent: number;
  bounced: number;
  spam_complaints: number;
  unsubscribed: number;
}

const THRESHOLDS = {
  bounce_rate: { warning: 2, critical: 5 },
  spam_rate: { warning: 0.1, critical: 0.3 },
  unsub_rate: { warning: 2, critical: 5 },
};

const DNS_CHECKS = [
  { label: 'SPF Record', description: 'Authorizes your sending domain', help: 'v=spf1 include:resend.com ~all' },
  { label: 'DKIM', description: 'Cryptographically signs your emails', help: 'Add DKIM record from Resend dashboard → Domains' },
  { label: 'DMARC', description: 'Policy for failed auth emails', help: 'v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com' },
  { label: 'Custom Domain', description: 'Send from your own domain (not shared)', help: 'Set up in Resend: Domains → Add Domain' },
];

function rateColor(rate: number, thresholds: { warning: number; critical: number }) {
  if (rate >= thresholds.critical) return 'text-red-400';
  if (rate >= thresholds.warning) return 'text-yellow-400';
  return 'text-green-400';
}

function rateStatus(rate: number, thresholds: { warning: number; critical: number }): 'ok' | 'warning' | 'critical' {
  if (rate >= thresholds.critical) return 'critical';
  if (rate >= thresholds.warning) return 'warning';
  return 'ok';
}

export default function DeliverabilityPage() {
  const [stats, setStats] = useState<DelivStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns?summary=1');
      if (res.ok) {
        const d = await res.json();
        const s = d.summary || {};
        setStats({
          bounce_rate: s.bounce_rate || 0,
          spam_rate: s.spam_rate || 0,
          unsub_rate: s.unsub_rate || 0,
          open_rate: parseFloat(s.avgOpenRate) || 0,
          total_sent: s.totalSent || 0,
          bounced: s.bounced || 0,
          spam_complaints: s.spam_complaints || 0,
          unsubscribed: s.unsubscribed || 0,
        });
      }
    } catch {
      // Use demo data if no real data
      setStats({ bounce_rate: 0, spam_rate: 0, unsub_rate: 0, open_rate: 0, total_sent: 0, bounced: 0, spam_complaints: 0, unsubscribed: 0 });
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const metrics = stats ? [
    {
      label: 'Bounce Rate',
      value: `${stats.bounce_rate.toFixed(2)}%`,
      raw: stats.bounce_rate,
      thresholds: THRESHOLDS.bounce_rate,
      description: 'Percentage of emails that couldn\'t be delivered',
      recommendation: 'Keep below 2%. Verify emails before sending.',
    },
    {
      label: 'Spam Complaint Rate',
      value: `${stats.spam_rate.toFixed(3)}%`,
      raw: stats.spam_rate,
      thresholds: THRESHOLDS.spam_rate,
      description: 'Percentage of recipients who marked as spam',
      recommendation: 'Keep below 0.1%. Add unsubscribe links and only email opt-ins.',
    },
    {
      label: 'Unsubscribe Rate',
      value: `${stats.unsub_rate.toFixed(2)}%`,
      raw: stats.unsub_rate,
      thresholds: THRESHOLDS.unsub_rate,
      description: 'Percentage of recipients who unsubscribed',
      recommendation: 'Keep below 2%. Improve segmentation and content relevancy.',
    },
  ] : [];

  const overallHealth = !stats ? 'unknown' :
    metrics.some((m) => rateStatus(m.raw, m.thresholds) === 'critical') ? 'critical' :
    metrics.some((m) => rateStatus(m.raw, m.thresholds) === 'warning') ? 'warning' : 'good';

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Deliverability</h1>
          <p className="text-navy-400 text-sm mt-1">Monitor sender reputation and email health</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall health banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
        overallHealth === 'good' ? 'bg-green-500/10 border border-green-500/20' :
        overallHealth === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
        overallHealth === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
        'bg-white/5 border border-white/10'
      }`}>
        {overallHealth === 'good' ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> :
         overallHealth === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" /> :
         overallHealth === 'critical' ? <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> :
         <Shield className="w-5 h-5 text-navy-400 flex-shrink-0" />}
        <div>
          <div className="font-semibold text-white text-sm">
            {overallHealth === 'good' ? 'Sender reputation: Healthy' :
             overallHealth === 'warning' ? 'Sender reputation: Needs attention' :
             overallHealth === 'critical' ? 'Sender reputation: At risk!' :
             'Send your first campaign to see deliverability metrics'}
          </div>
          {stats && stats.total_sent > 0 && (
            <div className="text-xs text-navy-400 mt-0.5">{stats.total_sent.toLocaleString()} emails sent in measurement period</div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : (
        <>
          {/* Rate metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {metrics.map((m) => {
              const status = rateStatus(m.raw, m.thresholds);
              return (
                <div key={m.label} className="bg-glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-navy-500">{m.label}</div>
                    {status === 'ok' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                     status === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                     <XCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${rateColor(m.raw, m.thresholds)}`}>{m.value}</div>
                  <div className="text-xs text-navy-500 mb-2">{m.description}</div>
                  {status !== 'ok' && (
                    <div className={`text-xs p-2 rounded-lg ${
                      status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      ⚠️ {m.recommendation}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-navy-600">
                    Safe: &lt;{m.thresholds.warning}% · Warning: &lt;{m.thresholds.critical}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* DNS / Authentication checklist */}
          <div className="bg-glass rounded-xl overflow-hidden mb-6">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold text-white text-sm">Email Authentication Checklist</h2>
              <p className="text-xs text-navy-400 mt-1">Proper DNS setup is required for good deliverability</p>
            </div>
            <div className="divide-y divide-white/5">
              {DNS_CHECKS.map((check, i) => (
                <div key={i} className="p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{check.label}</div>
                    <div className="text-xs text-navy-400 mb-1">{check.description}</div>
                    <code className="text-xs bg-white/5 text-accent-400 px-2 py-0.5 rounded">{check.help}</code>
                  </div>
                  <a href="https://resend.com/docs/send-with-resend/domains" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 flex-shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Best practices */}
          <div className="bg-glass rounded-xl p-5">
            <h2 className="font-semibold text-white text-sm mb-4">Deliverability Best Practices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '✅', tip: 'Only email confirmed opt-ins', detail: 'Single or double opt-in reduces spam complaints dramatically' },
                { icon: '✅', tip: 'Use Lead Enrichment to verify emails', detail: 'Invalid emails cause bounces which hurt your reputation' },
                { icon: '✅', tip: 'Add unsubscribe link to every email', detail: 'Required by law (CAN-SPAM, GDPR) and reduces spam complaints' },
                { icon: '✅', tip: 'Send from a custom domain', detail: 'Set up yourdomain.com in Resend instead of using shared domains' },
                { icon: '✅', tip: 'Warm up new domains gradually', detail: 'Start with 50/day, increase 20% per day for 4-6 weeks' },
                { icon: '✅', tip: 'Segment and personalize', detail: 'Relevant emails get higher open rates which improves reputation' },
              ].map((item) => (
                <div key={item.tip} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{item.tip}</div>
                    <div className="text-xs text-navy-400 mt-0.5">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
