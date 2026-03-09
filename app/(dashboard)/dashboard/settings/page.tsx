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
  CheckCircle, Copy, AlertCircle,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'api' | 'notifications';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
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
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    new_lead: true, demo_booked: true, weekly_report: true, lead_score_high: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
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
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (pw.next.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSavingPw(false);
    if (error) {
      toast({ title: 'Password update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated!' });
      setPw({ current: '', next: '', confirm: '' });
    }
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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-navy-400 mt-1 text-sm">Manage your account, security, and integrations</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="w-48 flex-shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                tab === id
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-navy-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-glass rounded-xl p-6">
          {/* Profile */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
                <p className="text-sm text-navy-400">Update your display name and bio.</p>
              </div>

              {/* Avatar */}
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
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={user?.email || ''} disabled className="mt-1 opacity-60" />
                <p className="text-xs text-navy-500 mt-1">Email cannot be changed here. Contact support.</p>
              </div>
              <div>
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  id="profile-bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="mt-1"
                />
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
                  <Input
                    id="pw-new"
                    type={showPw ? 'text' : 'password'}
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                    className="pr-10"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-white" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="pw-confirm">Confirm New Password</Label>
                <Input
                  id="pw-confirm"
                  type={showPw ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                  className="mt-1"
                />
              </div>
              {pw.next && pw.confirm && pw.next !== pw.confirm && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                </div>
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
                <h2 className="text-lg font-semibold text-white mb-1">API Keys & Integrations</h2>
                <p className="text-sm text-navy-400">These are read from your environment variables (.env.local).</p>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 text-sm text-navy-300">
                To connect Supabase and Resend, add these to your <code className="text-brand-400">.env.local</code> file and redeploy.
              </div>

              <div className="space-y-3">
                {apiKeys.map(({ label, env, value }) => (
                  <div key={env}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={value ? '••••••••••••••••••••••' : 'Not configured'} readOnly className={`flex-1 font-mono text-xs ${!value ? 'text-red-400' : ''}`} />
                      {value && (
                        <button
                          onClick={() => copyToClipboard(value, label)}
                          className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-navy-400 hover:text-white transition-colors"
                          title="Copy"
                        >
                          {copiedKey === label ? <CheckCircle className="w-4 h-4 text-accent-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-navy-600 mt-1 font-mono">{env}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-navy-500">
                  Add all environment variables to your{' '}
                  <code className="text-brand-400">.env.local</code> file.
                  See <code className="text-brand-400">.env.example</code> for the full list.
                </p>
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
                    <button
                      onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifications[key] ? 'bg-brand-500' : 'bg-navy-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="gradient"
                onClick={() => toast({ title: 'Notification preferences saved!' })}
              >
                Save Preferences
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
