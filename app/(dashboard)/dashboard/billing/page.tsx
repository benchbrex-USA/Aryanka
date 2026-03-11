'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, CreditCard, CheckCircle, AlertCircle,
  XCircle, Clock, ExternalLink, Zap,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface SubscriptionInfo {
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
  trial_end: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter:    ['250 leads/month', '500 emails/month', '1 website', '5 blog posts', '2 platforms', '100 CRM contacts'],
  pro:        ['Unlimited leads', '5,000 emails/month', '5 websites', 'Unlimited blog posts', '6 platforms', 'Unlimited CRM contacts'],
  enterprise: ['Unlimited everything', 'Unlimited emails', 'Unlimited websites', 'Priority support', 'Custom integrations', 'White label'],
};

const STATUS_META: Record<string, { label: string; icon: React.ElementType; badge: 'default' | 'success' | 'destructive' | 'secondary' | 'warning' }> = {
  active:   { label: 'Active',   icon: CheckCircle, badge: 'success' },
  trialing: { label: 'Trial',    icon: Clock,       badge: 'default' },
  canceled: { label: 'Canceled', icon: XCircle,     badge: 'secondary' },
  past_due: { label: 'Past Due', icon: AlertCircle, badge: 'warning' },
  unpaid:   { label: 'Unpaid',   icon: AlertCircle, badge: 'destructive' },
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BillingPage() {
  const [sub,            setSub]            = useState<SubscriptionInfo | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [portalLoading,  setPortalLoading]  = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_plan,subscription_status,subscription_period_end,trial_end,stripe_subscription_id,stripe_customer_id')
        .eq('id', user.id).single();
      setSub(data as SubscriptionInfo | null);
    } catch {
      setSub({ subscription_plan: 'starter', subscription_status: null, subscription_period_end: null, trial_end: null, stripe_subscription_id: null, stripe_customer_id: null });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
      window.location.href = data.url;
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (interval: 'monthly' | 'annual') => {
    setUpgradeLoading(true);
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro', interval }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
      setUpgradeLoading(false);
    }
  };

  const plan       = sub?.subscription_plan || 'starter';
  const status     = sub?.subscription_status;
  const isActive   = status === 'active' || status === 'trialing';
  const isPro      = plan === 'pro' || plan === 'enterprise';
  const statusMeta = status ? STATUS_META[status] : null;

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">Billing & Subscription</h1>
        <p className="text-xs text-[#555] mt-0.5">Manage your Aryanka subscription and billing details</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-5 h-5 animate-spin text-brand-400" /></div>
      ) : (
        <div className="space-y-4">

          {/* ── Current Plan ───────────────────────────────── */}
          <div className="rounded-xl border border-white/[0.07] bg-[#111] p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 className="text-base font-semibold text-[#ededed] capitalize">{plan} Plan</h2>
                  {statusMeta && (
                    <Badge variant={statusMeta.badge} className="text-xs">
                      <statusMeta.icon className="w-3 h-3 mr-1" />
                      {statusMeta.label}
                    </Badge>
                  )}
                  {!status && <Badge variant="secondary" className="text-xs">Free</Badge>}
                </div>
                <p className="text-xs text-[#555]">
                  {plan === 'starter' ? 'Get started with the basics'
                    : plan === 'pro'  ? 'Everything you need to grow'
                    : 'Unlimited scale for teams'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#444]" />
              </div>
            </div>

            {/* Key dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sub?.trial_end && (
                <div className="rounded-lg border border-brand-500/[0.2] bg-brand-500/[0.06] p-3.5">
                  <div className="text-xs text-[#555] mb-1">Trial Ends</div>
                  <div className="text-sm font-semibold text-brand-400">{formatDate(sub.trial_end)}</div>
                </div>
              )}
              {sub?.subscription_period_end && isActive && (
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3.5">
                  <div className="text-xs text-[#555] mb-1">
                    {status === 'trialing' ? 'Converts to paid' : 'Next renewal'}
                  </div>
                  <div className="text-sm font-semibold text-[#ededed]">{formatDate(sub.subscription_period_end)}</div>
                </div>
              )}
              {status === 'canceled' && sub?.subscription_period_end && (
                <div className="rounded-lg border border-red-500/[0.2] bg-red-500/[0.06] p-3.5">
                  <div className="text-xs text-[#555] mb-1">Access Ends</div>
                  <div className="text-sm font-semibold text-red-400">{formatDate(sub.subscription_period_end)}</div>
                </div>
              )}
            </div>

            {/* Included features */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#444] mb-3">Included in your plan</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                {(PLAN_FEATURES[plan] || PLAN_FEATURES.starter).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#777]">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-accent-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.06]">
              {sub?.stripe_customer_id && (
                <Button variant="secondary" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  Manage Billing
                </Button>
              )}
              {!isPro && (
                <>
                  <Button size="sm" onClick={() => handleUpgrade('monthly')} disabled={upgradeLoading}>
                    {upgradeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Upgrade to Pro — ₹2,999/mo
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleUpgrade('annual')} disabled={upgradeLoading}>
                    Annual (save 30%) — ₹24,999/yr
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── Upgrade CTA (starter only) ─────────────────── */}
          {!isPro && (
            <div className="rounded-xl border border-brand-500/[0.2] bg-gradient-to-br from-brand-500/[0.06] to-accent-500/[0.04] p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#ededed]">Unlock unlimited growth with Pro</h3>
                <p className="text-xs text-[#555] mt-0.5">14-day free trial · Cancel anytime · INR pricing</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                {PLAN_FEATURES.pro.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#777]">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => handleUpgrade('monthly')} disabled={upgradeLoading}>
                  {upgradeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Start Pro — ₹2,999/mo
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleUpgrade('annual')} disabled={upgradeLoading}>
                  Annual plan — ₹24,999/yr
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
