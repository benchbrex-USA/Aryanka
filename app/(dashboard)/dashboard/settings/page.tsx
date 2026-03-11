'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
  User, Lock, Bell, Loader2, CheckCircle, Paintbrush, Webhook,
  Shield, Mail, ExternalLink, Send, Share2,
  Linkedin, Twitter, Globe, Youtube, Instagram, Link2Off, Zap, Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'notifications' | 'white-label' | 'integrations' | 'platforms' | 'sso' | 'email-domain';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'security',      label: 'Security',      icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'platforms',     label: 'Platforms',     icon: Share2 },
  { id: 'white-label',   label: 'White Label',   icon: Paintbrush },
  { id: 'integrations',  label: 'Integrations',  icon: Webhook },
  { id: 'sso',           label: 'SSO / SAML',    icon: Shield },
  { id: 'email-domain',  label: 'Email Domain',  icon: Mail },
];

const inputCls = [
  'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
  'bg-[#111111] text-[#ededed] placeholder:text-[#555]',
  'border border-white/[0.08] transition-all duration-150',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/60',
  'hover:border-white/[0.12] hover:bg-[#161616]',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="pb-4 border-b border-white/[0.06] mb-5">
      <h2 className="text-sm font-semibold text-[#ededed]">{title}</h2>
      {desc && <p className="text-xs text-[#555] mt-1">{desc}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [tab,      setTab]      = useState<Tab>('profile');
  const [userEmail,setUserEmail]= useState('');
  const [profile,  setProfile]  = useState({ full_name: '', bio: '' });
  const [pw,       setPw]       = useState({ next: '', confirm: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [notifications, setNotifications] = useState({
    new_lead: true, demo_booked: true, weekly_report: true, lead_score_high: false,
  });
  const [whiteLabel, setWhiteLabel] = useState({
    company_name: '', logo_url: '', primary_color: '#00D4FF', accent_color: '#3B82F6',
    custom_domain: '', hide_powered_by: false, custom_footer_text: '',
  });
  const [integrations,    setIntegrations]    = useState({ slack_webhook_url: '' });
  const [emailDomain,     setEmailDomain]     = useState({ custom_email_domain: '' });
  const [connectedPlatforms, setConnectedPlatforms] = useState<Array<{ platform: string; platform_display_name: string; platform_username: string; connected_at: string }>>([]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const PLATFORM_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    linkedin:  { label: 'LinkedIn',    icon: Linkedin,  color: 'text-blue-400' },
    twitter:   { label: 'Twitter / X', icon: Twitter,   color: 'text-sky-400' },
    reddit:    { label: 'Reddit',      icon: Globe,     color: 'text-orange-400' },
    youtube:   { label: 'YouTube',     icon: Youtube,   color: 'text-red-400' },
    instagram: { label: 'Instagram',   icon: Instagram, color: 'text-pink-400' },
  };

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      setProfile({ full_name: user.user_metadata?.full_name || '', bio: user.user_metadata?.bio || '' });
    }
    fetch('/api/platforms/status').then((r) => r.json()).then((d) => {
      setConnectedPlatforms(d.platforms || []);
    }).catch(() => {});
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        setProfile((p) => ({ ...p, full_name: data.profile.full_name || p.full_name, bio: data.profile.bio || p.bio }));
        setNotifications({ new_lead: data.profile.notify_new_lead ?? true, demo_booked: data.profile.notify_demo_booked ?? true, weekly_report: data.profile.notify_weekly_report ?? true, lead_score_high: data.profile.notify_high_score ?? false });
        setIntegrations({ slack_webhook_url: data.profile.slack_webhook_url || '' });
        setEmailDomain({ custom_email_domain: data.profile.custom_email_domain || '' });
      }
      if (data.white_label) {
        setWhiteLabel({ company_name: data.white_label.company_name || '', logo_url: data.white_label.logo_url || '', primary_color: data.white_label.primary_color || '#00D4FF', accent_color: data.white_label.accent_color || '#3B82F6', custom_domain: data.white_label.custom_domain || '', hide_powered_by: data.white_label.hide_powered_by || false, custom_footer_text: data.white_label.custom_footer_text || '' });
      }
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async (type: string, data: object) => {
    setSaving(true);
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...data }) });
    setSaving(false);
    if (res.ok) toast({ title: 'Saved!', variant: 'success' });
    else {
      const err = await res.json();
      toast({ title: 'Save failed', description: err.error || 'Try again', variant: 'destructive' });
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (pw.next.length < 8)     { toast({ title: 'Minimum 8 characters required', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSaving(false);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Password updated!', variant: 'success' }); setPw({ next: '', confirm: '' }); }
  };

  const testSlack = async () => {
    if (!integrations.slack_webhook_url) { toast({ title: 'Enter a Slack webhook URL first', variant: 'destructive' }); return; }
    const res = await fetch(integrations.slack_webhook_url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '✅ Test from Aryanka — your Slack integration is working!' }) }).catch(() => null);
    if (res?.ok) toast({ title: 'Test message sent to Slack!', variant: 'success' });
    else         toast({ title: 'Slack test failed — check the webhook URL', variant: 'destructive' });
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">Settings</h1>
        <p className="text-xs text-[#555] mt-0.5">Manage your account, integrations, and enterprise features</p>
      </div>

      <div className="flex gap-5">
        {/* ── Tab sidebar ───────────────────────────────── */}
        <nav className="w-40 flex-shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-left transition-all duration-150',
                tab === id
                  ? 'bg-brand-500/[0.12] text-brand-400'
                  : 'text-[#666] hover:text-[#ededed] hover:bg-white/[0.05]'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', tab === id ? 'text-brand-400' : 'text-[#444]')} />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Content panel ─────────────────────────────── */}
        <div className="flex-1 rounded-xl border border-white/[0.07] bg-[#111] p-6 min-h-[420px]">

          {/* Profile */}
          {tab === 'profile' && (
            <form onSubmit={(e) => { e.preventDefault(); save('profile', profile); }} className="space-y-5">
              <SectionHeader title="Profile" desc="Update your display name and bio." />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)', color: '#fff' }}>
                  {(profile.full_name || userEmail || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#ededed]">{userEmail}</p>
                  <p className="text-xs text-[#555]">Supabase Auth account</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={userEmail} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself…" rows={3} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Profile</Button>
            </form>
          )}

          {/* Security */}
          {tab === 'security' && (
            <form onSubmit={savePassword} className="space-y-5">
              <SectionHeader title="Security" desc="Change your account password." />
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input type={showPw ? 'text' : 'password'} value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" required />
              </div>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Update Password</Button>
            </form>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <form onSubmit={(e) => { e.preventDefault(); save('notifications', notifications); }} className="space-y-5">
              <SectionHeader title="Notifications" desc="Choose what email notifications you receive." />
              <div className="space-y-3">
                {[
                  { key: 'new_lead' as const,       label: 'New lead captured',    desc: 'Email when a new lead submits a form' },
                  { key: 'demo_booked' as const,    label: 'Demo booking',          desc: 'Email when someone books a demo' },
                  { key: 'weekly_report' as const,  label: 'Weekly report',         desc: 'Summary of traffic and leads every Monday' },
                  { key: 'lead_score_high' as const,label: 'High-score lead alert', desc: 'Alert when a lead scores above 80' },
                ].map((n) => (
                  <label key={n.key} className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.06] hover:bg-white/[0.025] cursor-pointer transition-colors group">
                    <div className="mt-0.5 flex-shrink-0">
                      <input type="checkbox" checked={notifications[n.key]} onChange={(e) => setNotifications((ns) => ({ ...ns, [n.key]: e.target.checked }))} className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-brand-500 cursor-pointer accent-brand-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#ededed]">{n.label}</div>
                      <div className="text-xs text-[#555] mt-0.5">{n.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Preferences</Button>
            </form>
          )}

          {/* White Label */}
          {tab === 'white-label' && (
            <form onSubmit={(e) => { e.preventDefault(); save('white_label', whiteLabel); }} className="space-y-5">
              <SectionHeader title="White Label" desc="Customize branding for your dashboard and client-facing pages." />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Company Name</Label>
                  <Input value={whiteLabel.company_name} onChange={(e) => setWhiteLabel((w) => ({ ...w, company_name: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div className="space-y-1.5">
                  <Label>Logo URL</Label>
                  <Input value={whiteLabel.logo_url} onChange={(e) => setWhiteLabel((w) => ({ ...w, logo_url: e.target.value }))} placeholder="https://…" />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="w-9 h-9 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent p-0.5" />
                    <Input value={whiteLabel.primary_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, primary_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="w-9 h-9 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent p-0.5" />
                    <Input value={whiteLabel.accent_color} onChange={(e) => setWhiteLabel((w) => ({ ...w, accent_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Custom Domain</Label>
                  <Input value={whiteLabel.custom_domain} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_domain: e.target.value }))} placeholder="app.yourcompany.com" />
                  <p className="text-xs text-[#555]">Point your CNAME to <code className="text-brand-400 text-[11px]">cname.vercel-dns.com</code></p>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Custom Footer Text</Label>
                  <Input value={whiteLabel.custom_footer_text} onChange={(e) => setWhiteLabel((w) => ({ ...w, custom_footer_text: e.target.value }))} placeholder="© 2025 Acme Corp. All rights reserved." />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={whiteLabel.hide_powered_by} onChange={(e) => setWhiteLabel((w) => ({ ...w, hide_powered_by: e.target.checked }))} className="w-4 h-4 rounded accent-brand-500" />
                    <span className="text-sm text-[#ededed]">Hide "Powered by Aryanka" branding</span>
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save White Label Settings</Button>
            </form>
          )}

          {/* Integrations */}
          {tab === 'integrations' && (
            <form onSubmit={(e) => { e.preventDefault(); save('integrations', integrations); }} className="space-y-5">
              <SectionHeader title="Integrations" desc="Connect Slack and configure API keys." />

              {/* ENV vars info */}
              <div className="p-4 rounded-xl border border-yellow-500/[0.2] bg-yellow-500/[0.04] space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-[#ededed]">Required API Keys</span>
                </div>
                <p className="text-xs text-[#666]">Set these in <code className="text-yellow-400 text-[11px]">.env.local</code> or Vercel environment variables — not stored in the database.</p>
                <div className="space-y-2">
                  {[
                    { key: 'RESEND_API_KEY',    label: 'Resend',      desc: 'Email delivery for campaigns & sequences',      url: 'https://resend.com/api-keys' },
                    { key: 'ANTHROPIC_API_KEY', label: 'Anthropic',   desc: 'AI blog & content generation',                  url: 'https://console.anthropic.com/settings/keys' },
                    { key: 'HUNTER_API_KEY',    label: 'Hunter.io',   desc: 'Email verification in lead enrichment (optional)', url: 'https://hunter.io/api-keys' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-black/20 border border-white/[0.04]">
                      <div>
                        <code className="text-xs text-yellow-400">{item.key}</code>
                        <div className="text-xs text-[#555] mt-0.5">{item.label} — {item.desc}</div>
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:underline flex items-center gap-1 flex-shrink-0 mt-0.5">
                        Get key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead scoring shortcut */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div>
                  <div className="text-sm font-medium text-[#ededed]">Lead Scoring Rules</div>
                  <div className="text-xs text-[#555] mt-0.5">Configure which events add or subtract from lead scores</div>
                </div>
                <a href="/dashboard/settings/scoring" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
                  Configure <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Slack */}
              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#4A154B] flex items-center justify-center text-xs font-bold text-white">#</div>
                  <span className="text-sm font-semibold text-[#ededed]">Slack Notifications</span>
                </div>
                <p className="text-xs text-[#555]">Get notified in Slack when new leads come in or demos are booked.</p>
                <div className="space-y-1.5">
                  <Label>Slack Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={integrations.slack_webhook_url} onChange={(e) => setIntegrations((i) => ({ ...i, slack_webhook_url: e.target.value }))} placeholder="https://hooks.slack.com/services/…" className="flex-1" />
                    <Button type="button" variant="secondary" size="sm" onClick={testSlack}><Send className="w-3.5 h-3.5" /> Test</Button>
                  </div>
                </div>
                <p className="text-xs text-[#555]">
                  Create a webhook at{' '}
                  <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline inline-flex items-center gap-0.5">
                    api.slack.com/apps <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Integrations</Button>
            </form>
          )}

          {/* Platforms */}
          {tab === 'platforms' && (
            <div className="space-y-5">
              <SectionHeader title="Connected Platforms" desc="Connect your social accounts to enable one-click content syndication." />
              <div className="space-y-2">
                {(['linkedin', 'twitter', 'reddit', 'youtube', 'instagram'] as const).map((p) => {
                  const meta      = PLATFORM_META[p];
                  const Icon      = meta.icon;
                  const connected = connectedPlatforms.find((cp) => cp.platform === p);
                  return (
                    <div key={p} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.07] hover:border-white/[0.11] bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4', meta.color)} />
                        <div>
                          <div className="text-sm font-medium text-[#ededed]">{meta.label}</div>
                          {connected ? (
                            <div className="text-xs text-accent-400">@{connected.platform_username} · Connected {new Date(connected.connected_at).toLocaleDateString()}</div>
                          ) : (
                            <div className="text-xs text-[#555]">Not connected</div>
                          )}
                        </div>
                      </div>
                      {connected ? (
                        <button
                          onClick={async () => {
                            await fetch('/api/platforms/disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: p }) });
                            setConnectedPlatforms((prev) => prev.filter((cp) => cp.platform !== p));
                            toast({ title: `${meta.label} disconnected` });
                          }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/[0.2] hover:bg-red-500/[0.06] transition-colors"
                        >
                          <Link2Off className="w-3.5 h-3.5" /> Disconnect
                        </button>
                      ) : (
                        <a href={`/api/platforms/connect/${p}`} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-brand-500/[0.2] hover:bg-brand-500/[0.06] transition-colors">
                          Connect
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-xl border border-brand-500/[0.15] bg-brand-500/[0.04] text-xs text-[#666]">
                Connected platforms are used for automatic syndication. Manage from the{' '}
                <a href="/dashboard/content" className="text-brand-400 hover:underline">Syndication page</a>.
              </div>
            </div>
          )}

          {/* SSO */}
          {tab === 'sso' && (
            <div className="space-y-5">
              <SectionHeader title="SSO / SAML" desc="Enterprise single sign-on configuration." />
              <div className="p-4 rounded-xl border border-yellow-500/[0.2] bg-yellow-500/[0.04]">
                <p className="text-sm font-semibold text-yellow-400 mb-1">Enterprise Plan Required</p>
                <p className="text-xs text-[#666]">SSO/SAML is available on Enterprise. Contact <a href="mailto:enterprise@aryanka.io" className="text-brand-400 hover:underline">enterprise@aryanka.io</a> to enable.</p>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Google Workspace', doc: 'https://supabase.com/docs/guides/auth/social-login/auth-google',  color: '#EA4335' },
                  { name: 'Microsoft Azure AD',doc: 'https://supabase.com/docs/guides/auth/social-login/auth-azure', color: '#0078D4' },
                  { name: 'Okta',              doc: 'https://supabase.com/docs/guides/auth/sso/auth-okta',            color: '#007DC1' },
                  { name: 'Generic SAML 2.0',  doc: 'https://supabase.com/docs/guides/auth/sso',                      color: '#6b7280' },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.07] hover:border-white/[0.11] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: provider.color }} />
                      <span className="text-sm text-[#ededed]">{provider.name}</span>
                    </div>
                    <a href={provider.doc} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 flex items-center gap-1 hover:underline">
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
              <SectionHeader title="Custom Email Domain" desc="Send emails from your own domain instead of @aryanka.io." />
              <div className="space-y-1.5">
                <Label>Custom Domain</Label>
                <Input value={emailDomain.custom_email_domain} onChange={(e) => setEmailDomain({ custom_email_domain: e.target.value })} placeholder="mail.yourcompany.com" />
              </div>
              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-3">
                <p className="text-sm font-semibold text-[#ededed]">DNS Records to add in Resend</p>
                {[
                  { type: 'CNAME', name: 'resend._domainkey', value: 'resend._domainkey.resend.com' },
                  { type: 'TXT',   name: '@',                 value: 'v=spf1 include:resend.com ~all' },
                  { type: 'CNAME', name: 'em',                value: 'feedback-smtp.resend.com' },
                ].map((r) => (
                  <div key={r.name} className="font-mono text-xs p-2.5 rounded-lg bg-black/30 border border-white/[0.04] text-[#888]">
                    <span className="text-brand-400">{r.type}</span> <span className="text-[#ededed]">{r.name}</span> → {r.value}
                  </div>
                ))}
                <p className="text-xs text-[#555]">
                  Verify your domain at{' '}
                  <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline inline-flex items-center gap-0.5">
                    resend.com/domains <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Save Email Domain
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
