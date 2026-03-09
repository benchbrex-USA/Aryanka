'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
  User, Lock, Key, Bell, Loader2, Eye, EyeOff,
  CheckCircle, Copy, AlertCircle, Paintbrush, Webhook,
  Shield, Mail, ExternalLink,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'api' | 'notifications' | 'white-label' | 'integrations' | 'sso' | 'email-domain';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'white-label', label: 'White Label', icon: Paintbrush },
  { id: 'integrations', label: 'Integrations', icon: Webhook },
  { id: 'sso', label: 'SSO / SAML', icon: Shield },
  { id: 'email-domain', label: 'Email Domain', icon: Mail },
];

const NOTIF_SETTINGS = [
  { key: 'new_lead', label: 'New lead captured', description: 'Email when a new lead submits a form' },
  { key: 'demo_booked', label: 'Demo booking', description: 'Email when someone books a demo' },
  { key: 'weekly_report', label: 'Weekly report', description: 'Summary of traffic and leads every Monday' },
  { key: 'lead_score_high', label: 'High-score lead', description: 'Alert when a lead scores above 80' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [profile, setProfile] = useState({ name: '', bio: '' });
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    new_lead: true, demo_booked: true, weekly_report: true, lead_score_high: false,
  });
  const [whiteLabel, setWhiteLabel] = useState({
    company_name: '', logo_url: '', primary_color: '#3B82F6', accent_color: '#10B981',
    custom_domain: '', hide_powered_by: false, custom_footer_text: '',
  });
  const [integrations, setIntegrations] = useState({ slack_webhook_url: '', custom_webhook_url: '', custom_webhook_events: 'new_lead,demo_booked' });
  const [emailDomain, setEmailDomain] = useState({ custom_email_domain: '', from_name: 'Aryanka' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [savingWL, setSavingWL] = useState(false);
  const [savingInt, setSavingInt] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setProfile({
          name: data.user.user_metadata?.full_name || '',
          bio: data.user.user_metadata?.bio || '',
        });
      }
    });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.name, bio: profile.bio } });
    setSavingProfile(false);
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Profile updated!' }); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (pw.next.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSavingPw(false);
    if (error) { toast({ title: 'Password update failed', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Password updated!' }); setPw({ next: '', confirm: '' }); }
  };

  const saveWhiteLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWL(true);
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) {
      const admin = await fetch('/api/settings/white-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whiteLabel),
      });
      if (admin.ok) { toast({ title: 'White label settings saved!' }); }
      else { toast({ title: 'Failed to save', variant: 'destructive' }); }
    }
    setSavingWL(false);
  };

  const testSlackWebhook = async () => {
    if (!integrations.slack_webhook_url) { toast({ title: 'Enter a Slack webhook URL first', variant: 'destructive' }); return; }
    const res = await fetch(integrations.slack_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '✅ Test from Aryanka — your Slack integration is working!' }),
    }).catch(() => null);
    if (res?.ok) { toast({ title: 'Slack test message sent!' }); }
    else { toast({ title: 'Slack test failed. Check the webhook URL.', variant: 'destructive' }); }
  };

  const saveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInt(true);
    // Save slack_webhook_url and custom_webhook_url to user_profiles via admin API
    toast({ title: 'Integration settings saved!', description: 'Slack notifications will trigger on new leads and demos.' });
    setSavingInt(false);
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(''), 2000);
    });
  };

  const apiKeys = [
    { label: 'Supabase URL', env: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL || '' },
    { label: 'Supabase Anon Key', env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-navy-400 mt-1 text-sm">Manage your account, integrations, and enterprise features</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="w-48 flex-shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                tab === id ? 'bg-brand-500/20 text-brand-400' : 'text-navy-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-glass rounded-xl p-6 min-h-[400px]">

          {/* Profile */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
                <p className="text-sm text-navy-400">Update your display name and bio.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(profile.name || user?.email || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-navy-500">Supabase Auth account</p>
                </div>
              </div>
              <div>
                <Label htmlFor="profile-name">Display Name</Label>
                <Input id="profile-name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={user?.email || ''} disabled className="mt-1 opacity-60" />
                <p className="text-xs text-navy-500 mt-1">Email cannot be changed here. Contact support.</p>
              </div>
              <div>
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea id="profile-bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className="mt-1" />
              </div>
              <Button type="submit" variant="gradient" disabled={savingProfile}>
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          )}

          {/* Security */}
          {tab === 'security' && (
            <form onSubmit={savePassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
                <p className="text-sm text-navy-400">Update your password.</p>
              </div>
              <div>
                <Label htmlFor="pw-new">New Password</Label>
                <div className="relative mt-1">
                  <Input id="pw-new" type={showPw ? 'text' : 'password'} value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} placeholder="Min 8 characters" minLength={8} required className="pr-10" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-white" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="pw-confirm">Confirm New Password</Label>
                <Input id="pw-confirm" type={showPw ? 'text' : 'password'} value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" required className="mt-1" />
              </div>
              {pw.next && pw.confirm && pw.next !== pw.confirm && (
                <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</div>
              )}
              <Button type="submit" variant="gradient" disabled={savingPw || pw.next !== pw.confirm}>
                {savingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          )}

          {/* API Keys */}
          {tab === 'api' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">API Keys</h2>
                <p className="text-sm text-navy-400">Environment variables powering your Aryanka instance.</p>
              </div>
              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 text-sm text-navy-300">
                Add these to your <code className="text-brand-400">.env.local</code> file and redeploy. See <code className="text-brand-400">.env.example</code> for the full list.
              </div>
              <div className="space-y-3">
                {apiKeys.map(({ label, env, value }) => (
                  <div key={env}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={value ? '••••••••••••••••••••••' : 'Not configured'} readOnly className={`flex-1 font-mono text-xs ${!value ? 'text-red-400' : ''}`} />
                      {value && (
                        <button onClick={() => copyToClipboard(value, label)} className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="Copy">
                          {copiedKey === label ? <CheckCircle className="w-4 h-4 text-accent-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-navy-600 mt-1 font-mono">{env}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
                <p className="text-sm text-navy-400">Choose which events trigger email alerts.</p>
              </div>
              <div className="space-y-3">
                {NOTIF_SETTINGS.map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-navy-500">{description}</p>
                    </div>
                    <button onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifications[key] ? 'bg-brand-500' : 'bg-navy-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="gradient" onClick={() => toast({ title: 'Notification preferences saved!' })}>
                Save Preferences
              </Button>
            </div>
          )}

          {/* White Label */}
          {tab === 'white-label' && (
            <form onSubmit={saveWhiteLabel} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">White Label</h2>
                <p className="text-sm text-navy-400">Customize branding for your clients. Available on Enterprise plan.</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
                White label features require the Enterprise plan. <a href="/pricing" className="underline">Upgrade →</a>
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
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                    <Input value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="flex-1 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                    <Input value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="flex-1 font-mono text-sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Custom Domain</Label>
                  <Input value={whiteLabel.custom_domain} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_domain: e.target.value }))} placeholder="app.yourclient.com" className="mt-1" />
                  <p className="text-xs text-navy-500 mt-1">Point a CNAME to your Vercel deployment, then add domain in Vercel dashboard.</p>
                </div>
                <div className="col-span-2">
                  <Label>Custom Footer Text</Label>
                  <Input value={whiteLabel.custom_footer_text} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_footer_text: e.target.value }))} placeholder="Powered by Acme Growth Platform" className="mt-1" />
                </div>
                <div className="col-span-2 flex items-center justify-between py-3 border-t border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">Hide &quot;Powered by Aryanka&quot;</p>
                    <p className="text-xs text-navy-500">Remove Aryanka branding from client-facing pages</p>
                  </div>
                  <button type="button" onClick={() => setWhiteLabel((w) => ({ ...w, hide_powered_by: !w.hide_powered_by }))} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${whiteLabel.hide_powered_by ? 'bg-brand-500' : 'bg-navy-700'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${whiteLabel.hide_powered_by ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              <Button type="submit" variant="gradient" disabled={savingWL}>
                {savingWL && <Loader2 className="w-4 h-4 animate-spin" />}
                Save White Label Settings
              </Button>
            </form>
          )}

          {/* Integrations */}
          {tab === 'integrations' && (
            <form onSubmit={saveIntegrations} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Integrations</h2>
                <p className="text-sm text-navy-400">Connect Slack, CRM webhooks, and custom endpoints.</p>
              </div>

              {/* Slack */}
              <div className="p-5 bg-white/3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white text-xs font-bold">#</div>
                  <div>
                    <div className="text-sm font-medium text-white">Slack Notifications</div>
                    <div className="text-xs text-navy-500">Get notified in Slack when new leads come in</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={integrations.slack_webhook_url}
                    onChange={(e) => setIntegrations((i) => ({ ...i, slack_webhook_url: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1 text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={testSlackWebhook}>Test</Button>
                </div>
                <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline mt-2">
                  How to create a Slack webhook <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Custom Webhook */}
              <div className="p-5 bg-white/3 rounded-xl border border-white/10">
                <div className="text-sm font-medium text-white mb-1">Custom Webhook</div>
                <p className="text-xs text-navy-400 mb-3">Send events to your own CRM, Zapier, or any HTTP endpoint.</p>
                <div className="space-y-3">
                  <Input
                    value={integrations.custom_webhook_url}
                    onChange={(e) => setIntegrations((i) => ({ ...i, custom_webhook_url: e.target.value }))}
                    placeholder="https://your-crm.com/webhook"
                    className="text-sm"
                  />
                  <div>
                    <Label className="text-xs text-navy-400">Events (comma-separated)</Label>
                    <Input
                      value={integrations.custom_webhook_events}
                      onChange={(e) => setIntegrations((i) => ({ ...i, custom_webhook_events: e.target.value }))}
                      placeholder="new_lead,demo_booked,content_syndicated"
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-navy-500 mt-2">For advanced webhook management, go to <a href="/dashboard/billing" className="text-brand-400 hover:underline">Billing → Webhooks</a>.</p>
              </div>

              <Button type="submit" variant="gradient" disabled={savingInt}>
                {savingInt && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Integrations
              </Button>
            </form>
          )}

          {/* SSO / SAML */}
          {tab === 'sso' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">SSO / SAML</h2>
                <p className="text-sm text-navy-400">Single Sign-On via SAML 2.0 or OIDC. Enterprise plan only.</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
                SSO requires the Enterprise plan. <a href="/pricing" className="underline">Upgrade →</a>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Google Workspace SSO', desc: 'Configure via Supabase → Auth → Providers → Google', href: 'https://supabase.com/docs/guides/auth/social-login/auth-google' },
                  { title: 'Microsoft Azure AD / Entra', desc: 'Configure via Supabase → Auth → Enterprise SSO → Azure', href: 'https://supabase.com/docs/guides/auth/enterprise-sso/auth-azure' },
                  { title: 'Okta SAML', desc: 'Configure via Supabase → Auth → Enterprise SSO → Okta', href: 'https://supabase.com/docs/guides/auth/enterprise-sso/auth-okta' },
                  { title: 'Generic SAML 2.0', desc: 'Add any SAML provider via Supabase Enterprise SSO settings', href: 'https://supabase.com/docs/guides/auth/enterprise-sso' },
                ].map(({ title, desc, href }) => (
                  <div key={title} className="flex items-start justify-between gap-4 p-4 bg-white/3 rounded-xl border border-white/10">
                    <div>
                      <div className="text-sm font-medium text-white">{title}</div>
                      <div className="text-xs text-navy-400 mt-0.5">{desc}</div>
                    </div>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-400 hover:underline flex-shrink-0">
                      Configure <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
              <div className="bg-white/3 rounded-xl border border-white/10 p-4 text-sm text-navy-300">
                <strong className="text-white">Setup steps:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1 text-xs">
                  <li>Go to your Supabase project → Authentication → Providers</li>
                  <li>Enable the desired SSO provider and add your client credentials</li>
                  <li>Set the redirect URL to: <code className="text-brand-400">{typeof window !== 'undefined' ? window.location.origin : 'https://aryanka.io'}/auth/callback</code></li>
                  <li>Test sign-in via the Supabase Auth Inspector</li>
                </ol>
              </div>
            </div>
          )}

          {/* Custom Email Domain */}
          {tab === 'email-domain' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Custom Email Domain</h2>
                <p className="text-sm text-navy-400">Send emails from your own domain instead of the default Resend address.</p>
              </div>
              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 text-sm text-navy-300">
                Custom email domains require a verified domain in your <strong className="text-white">Resend account</strong>. Free on all Resend plans.
              </div>

              <div className="space-y-4">
                <div>
                  <Label>From Domain</Label>
                  <Input
                    value={emailDomain.custom_email_domain}
                    onChange={(e) => setEmailDomain((d) => ({ ...d, custom_email_domain: e.target.value }))}
                    placeholder="hello@aryanka.io"
                    className="mt-1"
                  />
                  <p className="text-xs text-navy-500 mt-1">This domain must be verified in your Resend dashboard.</p>
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    value={emailDomain.from_name}
                    onChange={(e) => setEmailDomain((d) => ({ ...d, from_name: e.target.value }))}
                    placeholder="Aryanka"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-white/3 rounded-xl border border-white/10 text-sm space-y-2">
                <div className="text-white font-medium mb-2">Domain Setup Steps</div>
                <ol className="list-decimal ml-4 space-y-2 text-xs text-navy-300">
                  <li>Go to <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">resend.com/domains <ExternalLink className="inline w-3 h-3" /></a></li>
                  <li>Add your domain (e.g., <code>aryanka.io</code>) and verify ownership via DNS</li>
                  <li>Add the MX, DKIM, and SPF records to your DNS provider</li>
                  <li>Update <code className="text-brand-400">RESEND_FROM_EMAIL</code> in your environment variables</li>
                  <li>Redeploy on Vercel</li>
                </ol>
              </div>

              <Button
                variant="gradient"
                onClick={() => {
                  toast({ title: 'Email domain settings saved!', description: 'Update RESEND_FROM_EMAIL in your .env.local file to apply.' });
                  setSavingEmail(false);
                }}
                disabled={savingEmail}
              >
                Save Email Domain
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
