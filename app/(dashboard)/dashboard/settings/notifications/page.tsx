'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Bell, Mail, Slack, Loader2, CheckCircle } from 'lucide-react';

const EMAIL_ALERTS = [
  { key: 'new_lead', label: 'New Lead', desc: 'When a new lead signs up or is captured' },
  { key: 'hot_lead', label: 'Hot Lead Score', desc: 'When a lead score exceeds threshold' },
  { key: 'campaign_sent', label: 'Campaign Sent', desc: 'Email campaign sent confirmation' },
  { key: 'campaign_reply', label: 'Campaign Reply', desc: 'When a lead replies to an outbound email' },
  { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Weekly summary of leads, posts, and performance' },
];

const SLACK_EVENTS = [
  { key: 'new_lead', label: 'New leads' },
  { key: 'hot_lead', label: 'Hot leads (score ≥ threshold)' },
  { key: 'interested_reply', label: 'Interested email replies' },
  { key: 'daily_report', label: 'Daily summary report' },
];

export default function NotificationsSettingsPage() {
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({
    new_lead: true, hot_lead: true, campaign_sent: false, campaign_reply: true, weekly_digest: true,
  });
  const [slackPrefs, setSlackPrefs] = useState<Record<string, boolean>>({
    new_lead: true, hot_lead: true, interested_reply: false, daily_report: false,
  });
  const [slackWebhook, setSlackWebhook] = useState('');
  const [hotThreshold, setHotThreshold] = useState('70');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      if (data.profile) {
        setEmailPrefs({
          new_lead: data.profile.notify_new_lead ?? true,
          hot_lead: data.profile.notify_high_score ?? true,
          campaign_sent: false,
          campaign_reply: true,
          weekly_digest: data.profile.notify_weekly_report ?? true,
        });
        setSlackWebhook(data.profile.slack_webhook_url || '');
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const [notifRes, integRes] = await Promise.all([
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notifications',
          new_lead: emailPrefs.new_lead,
          demo_booked: true,
          weekly_report: emailPrefs.weekly_digest,
          lead_score_high: emailPrefs.hot_lead,
        }),
      }),
      slackWebhook ? fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'integrations', slack_webhook_url: slackWebhook }),
      }) : Promise.resolve({ ok: true }),
    ]);
    setSaving(false);
    if (notifRes.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: 'Notification preferences saved!' });
    } else {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Notification Settings</h1>
        <p className="text-navy-400 text-sm mt-1">Control when and how Aryanka alerts you</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hot lead threshold */}
        <div className="bg-glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Alert Thresholds</h2>
          </div>
          <div className="max-w-xs">
            <Label htmlFor="threshold">Hot Lead Score Threshold: {hotThreshold}</Label>
            <input
              id="threshold"
              type="range"
              min="0"
              max="100"
              value={hotThreshold}
              onChange={(e) => setHotThreshold(e.target.value)}
              className="mt-2 w-full accent-brand-500"
            />
            <p className="text-xs text-navy-500 mt-1">Trigger alerts when a lead score reaches or exceeds {hotThreshold}/100</p>
          </div>
        </div>

        {/* Email notifications */}
        <div className="bg-glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Email Notifications</h2>
          </div>
          <div className="space-y-3">
            {EMAIL_ALERTS.map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm text-white font-medium">{label}</div>
                  <div className="text-xs text-navy-500">{desc}</div>
                </div>
                <div
                  onClick={() => setEmailPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${emailPrefs[key] ? 'bg-brand-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Slack notifications */}
        <div className="bg-glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Slack className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Slack Notifications</h2>
          </div>
          <div className="mb-4">
            <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
            <Input
              id="slack-webhook"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-navy-500 mt-1">Create an Incoming Webhook in your Slack workspace settings</p>
          </div>
          <div className="space-y-3">
            {SLACK_EVENTS.map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <div className="text-sm text-white">{label}</div>
                <div
                  onClick={() => setSlackPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${slackPrefs[key] ? 'bg-brand-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${slackPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" variant="gradient" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </form>
    </div>
  );
}
