'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
  User, Lock, Bell, Loader2,
  CheckCircle, Paintbrush, Webhook,
  Shield, Mail, ExternalLink, Send,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'white-label' | 'integrations' | 'sso' | 'email-domain';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'white-label', label: 'White Label', icon: Paintbrush },
  { id: 'integrations', label: 'Integrations', icon: Webhook },
  { id: 'sso', label: 'SSO / SAML', icon: Shield },
  { id: 'email-domain', label: 'Email Domain', icon: Mail },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState({ full_name: '', bio: '' });
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [notifications, setNotifications] = useState({
    new_lead: true, demo_booked: true, weekly_report: true, lead_score_high: false,
  });
  const [whiteLabel, setWhiteLabel] = useState({
    company_name: '', logo_url: '', primary_color: '#00D4FF', accent_color: '#3B82F6',
    custom_domain: '', hide_powered_by: false, custom_footer_text: '',
  });
  const [integrations, setIntegrations] = useState({ slack_webhook_url: '' });
  const [emailDomain, setEmailDomain] = useState({ custom_email_domain: '' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || '',
      });
    }
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        setProfile((p) => ({ ...p, full_name: data.profile.full_name || p.full_name, bio: data.profile.bio || p.bio }));
        setNotifications({
          new_lead: data.profile.notify_new_lead ?? true,
          demo_booked: data.profile.notify_demo_booked ?? true,
          weekly_report: data.profile.notify_weekly_report ?? true,
          lead_score_high: data.profile.notify_high_score ?? false,
        });
        setIntegrations({ slack_webhook_url: data.profile.slack_webhook_url || '' });
        setEmailDomain({ custom_email_domain: data.profile.custom_email_domain || '' });
      }
      if (data.white_label) {
        setWhiteLabel({
          company_name: data.white_label.company_name || '',
          logo_url: data.white_label.logo_url || '',
          primary_color: data.white_label.primary_color || '#00D4FF',
          accent_color: data.white_label.accent_color || '#3B82F6',
          custom_domain: data.white_label.custom_domain || '',
          hide_powered_by: data.white_label.hide_powered_by || false,
          custom_footer_text: data.white_label.custom_footer_text || '',
        });
      }
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async (type: string, data: object) => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
    setSaving(false);
    if (res.ok) toast({ title: 'Saved!' });
    else {
      const err = await res.json();
      toast({ title: 'Save failed', description: err.error || 'Try again', variant: 'destructive' });
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (pw.next.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSaving(false);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Password updated!' }); setPw({ next: '', confirm: '' }); }
  };

  const testSlack = async () => {
    if (!integrations.slack_webhook_url) { toast({ title: 'Enter a Slack webhook URL first', variant: 'destructive' }); return; }
    const res = await fetch(integrations.slack_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '✅ Test from Aryanka — your Slack integration is working!' }),
    }).catch(() => null);
    if (res?.ok) toast({ title: 'Test message sent to Slack!' });
    else toast({ title: 'Slack test failed — check the webhook URL', variant: 'destructive' });
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/[0.08] outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors bg-white/[0.04]';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-navy-400 mt-1 text-sm">Manage your account, integrations, and enterprise features</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="w-44 flex-shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                tab === id ? 'bg-[rgba(0,212,255,0.08)] text-[#00D4FF]' : 'text-navy-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-glass rounded-xl p-6 min-h-[420px]">

          {/* Profile */}
          {tab === 'profile' && (
            <form onSubmit={(e) => { e.preventDefault(); save('profile', profile); }} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
                <p className="text-sm text-navy-400">Update your display name and bio.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)', color: '#080808' }}>
                  {(profile.full_name || userEmail || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{userEmail}</p>
                  <p className="text-xs text-navy-500">Supabase Auth account</p>
                </div>
              </div>
              <div>
                <Label>Display Name</Label>
                <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={userEmail} disabled className="mt-1 opacity-50" />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className="mt-1" />
              </div>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          )}

          {/* Security */}
          {tab === 'security' && (
            <form onSubmit={savePassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
                <p className="text-sm text-navy-400">Change your password.</p>
              </div>
              <div>
                <Label>New Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white">
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat password"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <form onSubmit={(e) => { e.preventDefault(); save('notifications', notifications); }} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
                <p className="text-sm text-navy-400">Choose what email notifications you receive.</p>
              </div>
              {[
                { key: 'new_lead' as const, label: 'New lead captured', desc: 'Email when a new lead submits a form' },
                { key: 'demo_booked' as const, label: 'Demo booking', desc: 'Email when someone books a demo' },
                { key: 'weekly_report' as const, label: 'Weekly report', desc: 'Summary of traffic and leads every Monday' },
                { key: 'lead_score_high' as const, label: 'High-score lead alert', desc: 'Alert when a lead scores above 80' },
              ].map((n) => (
                <label key={n.key} className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={notifications[n.key]}
                      onChange={(e) => setNotifications((ns) => ({ ...ns, [n.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00D4FF] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-white/90">{n.label}</div>
                    <div className="text-xs text-navy-500 mt-0.5">{n.desc}</div>
                  </div>
                </label>
              ))}
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Preferences
              </Button>
            </form>
          )}

          {/* White Label */}
          {tab === 'white-label' && (
            <form onSubmit={(e) => { e.preventDefault(); save('white_label', whiteLabel); }} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">White Label</h2>
                <p className="text-sm text-navy-400">Customize branding for your dashboard and client-facing pages.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={whiteLabel.company_name} onChange={(e) => setWhiteLabel((w) => ({ ...w, company_name: e.target.value }))} placeholder="Acme Corp" className="mt-1" />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input value={whiteLabel.logo_url} onChange={(e) => setWhiteLabel((w) => ({ ...w, logo_url: e.target.value }))} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                    <Input value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                    <Input value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Custom Domain</Label>
                  <Input value={whiteLabel.custom_domain} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_domain: e.target.value }))} placeholder="app.yourcompany.com" className="mt-1" />
                  <p className="text-xs text-navy-500 mt-1">Point your CNAME to <code className="text-[#00D4FF]">cname.vercel-dns.com</code></p>
                </div>
                <div className="col-span-2">
                  <Label>Custom Footer Text</Label>
                  <Input value={whiteLabel.custom_footer_text} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_footer_text: e.target.value }))} placeholder="© 2025 Acme Corp. All rights reserved." className="mt-1" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" checked={whiteLabel.hide_powered_by} onChange={(e) => setWhiteLabel((w) => ({ ...w, hide_powered_by: e.target.checked }))} className="w-4 h-4 rounded" />
                  <Label className="cursor-pointer">Hide "Powered by Aryanka" branding</Label>
                </div>
              </div>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save White Label Settings
              </Button>
            </form>
          )}

          {/* Integrations */}
          {tab === 'integrations' && (
            <form onSubmit={(e) => { e.preventDefault(); save('integrations', integrations); }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Integrations</h2>
                <p className="text-sm text-navy-400">Connect Slack and custom webhooks for real-time notifications.</p>
              </div>

              {/* Slack */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-[#4A154B] flex items-center justify-center text-xs font-bold text-white">#</div>
                  <span className="text-sm font-semibold text-white">Slack Notifications</span>
                </div>
                <p className="text-xs text-navy-400">Get notified in Slack when new leads come in or demos are booked.</p>
                <Label>Slack Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={integrations.slack_webhook_url}
                    onChange={(e) => setIntegrations((i) => ({ ...i, slack_webhook_url: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={testSlack}>
                    <Send className="w-3.5 h-3.5" />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-navy-500">
                  Create a webhook at{' '}
                  <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline inline-flex items-center gap-0.5">
                    api.slack.com/apps <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Integrations
              </Button>
            </form>
          )}

          {/* SSO */}
          {tab === 'sso' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">SSO / SAML</h2>
                <p className="text-sm text-navy-400">Enterprise single sign-on configuration.</p>
              </div>
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                <p className="text-sm text-yellow-400 font-medium mb-1">Enterprise Plan Required</p>
                <p className="text-xs text-navy-400">SSO/SAML is available on the Enterprise plan. Contact us at <a href="mailto:enterprise@aryanka.io" className="text-[#00D4FF]">enterprise@aryanka.io</a> to enable it.</p>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Google Workspace', doc: 'https://supabase.com/docs/guides/auth/social-login/auth-google', color: '#EA4335' },
                  { name: 'Microsoft Azure AD', doc: 'https://supabase.com/docs/guides/auth/social-login/auth-azure', color: '#0078D4' },
                  { name: 'Okta', doc: 'https://supabase.com/docs/guides/auth/sso/auth-okta', color: '#007DC1' },
                  { name: 'Generic SAML 2.0', doc: 'https://supabase.com/docs/guides/auth/sso', color: '#6b7280' },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: provider.color }} />
                      <span className="text-sm text-white">{provider.name}</span>
                    </div>
                    <a href={provider.doc} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00D4FF] flex items-center gap-1 hover:underline">
                      Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Domain */}
          {tab === 'email-domain' && (
            <form onSubmit={(e) => { e.preventDefault(); save('email_domain', emailDomain); }} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Custom Email Domain</h2>
                <p className="text-sm text-navy-400">Send emails from your own domain instead of @aryanka.io.</p>
              </div>
              <div>
                <Label>Custom Domain</Label>
                <Input
                  value={emailDomain.custom_email_domain}
                  onChange={(e) => setEmailDomain({ custom_email_domain: e.target.value })}
                  placeholder="mail.yourcompany.com"
                  className="mt-1"
                />
              </div>
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <p className="text-sm font-medium text-white">DNS Records to add in Resend:</p>
                {[
                  { type: 'CNAME', name: 'resend._domainkey', value: 'resend._domainkey.resend.com' },
                  { type: 'TXT', name: '@', value: 'v=spf1 include:resend.com ~all' },
                  { type: 'CNAME', name: 'em', value: 'feedback-smtp.resend.com' },
                ].map((r) => (
                  <div key={r.name} className="font-mono text-xs p-2 rounded-lg bg-black/30 text-navy-300">
                    <span className="text-[#00D4FF]">{r.type}</span> {r.name} → {r.value}
                  </div>
                ))}
                <p className="text-xs text-navy-500">
                  Verify your domain at{' '}
                  <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline inline-flex items-center gap-0.5">
                    resend.com/domains <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                Save Email Domain
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
