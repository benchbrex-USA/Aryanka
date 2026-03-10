'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Webhook, Trash2, Loader2, CheckCircle, XCircle, ToggleLeft, ToggleRight, Copy, ExternalLink } from 'lucide-react';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  delivery_count: number;
  last_triggered_at: string | null;
  last_status: number | null;
  created_at: string;
}

const ALL_EVENTS = [
  { value: 'new_lead', label: 'New Lead Captured', description: 'Fires when any lead is created' },
  { value: 'lead_status_changed', label: 'Lead Status Changed', description: 'Fires when a lead moves stages' },
  { value: 'email_opened', label: 'Email Opened', description: 'Fires when a lead opens an email' },
  { value: 'email_clicked', label: 'Email Link Clicked', description: 'Fires when a lead clicks a link' },
  { value: 'form_submitted', label: 'Form Submitted', description: 'Fires on any form submission' },
  { value: 'demo_booked', label: 'Demo Booked', description: 'Fires when a demo is scheduled' },
  { value: 'score_changed', label: 'Score Changed', description: 'Fires when lead score updates' },
];

const SAMPLE_PAYLOAD = {
  event: 'new_lead',
  timestamp: new Date().toISOString(),
  data: {
    id: 'lead_123',
    email: 'john@acme.com',
    name: 'John Smith',
    company: 'Acme Corp',
    source: 'linkedin',
    score: 75,
    status: 'new',
  },
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: '', events: [] as string[], secret: '' });

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/webhooks');
    if (res.ok) {
      const d = await res.json();
      setWebhooks(d.webhooks || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || form.events.length === 0) {
      toast({ title: 'URL and at least one event required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Webhook created!' });
      setOpen(false);
      setForm({ url: '', events: [], secret: '' });
      fetchWebhooks();
    } catch {
      toast({ title: 'Failed to create webhook', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (wh: Webhook) => {
    await fetch('/api/webhooks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: wh.id, is_active: !wh.is_active }),
    });
    fetchWebhooks();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/webhooks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast({ title: 'Webhook deleted' });
  };

  const handleTest = async (id: string) => {
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', id }),
    });
    const d = await res.json();
    if (res.ok) {
      toast({ title: 'Test payload sent!', description: `Status: ${d.status}` });
    } else {
      toast({ title: 'Test failed', description: d.error, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-navy-400 text-sm mt-1">Send real-time data to any URL — Zapier, Make.com, or your own server</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Webhook
        </Button>
      </div>

      {/* Integrations note */}
      <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-white mb-2">Connect to 6,000+ apps via Zapier</h3>
        <div className="text-xs text-navy-400 space-y-1">
          <p>Use the <code className="bg-white/5 px-1 rounded">new_lead</code> trigger webhook URL as your Zapier custom webhook to connect Aryanka to HubSpot, Slack, Google Sheets, and more.</p>
        </div>
      </div>

      {/* Sample payload */}
      <div className="bg-glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Sample Payload</h3>
          <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(SAMPLE_PAYLOAD, null, 2)); toast({ title: 'Copied!' }); }} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <Copy className="w-3 h-3" />Copy
          </button>
        </div>
        <pre className="text-xs text-accent-400 overflow-x-auto">{JSON.stringify(SAMPLE_PAYLOAD, null, 2)}</pre>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : webhooks.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Webhook className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No webhooks yet. Add one to connect Aryanka to your stack.</p>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Add Webhook</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="bg-glass rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded truncate max-w-xs">{wh.url}</code>
                    <Badge variant={wh.is_active ? 'success' : 'secondary'} className="text-xs">
                      {wh.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {wh.events.map((ev) => (
                      <span key={ev} className="text-xs bg-white/5 text-navy-400 px-2 py-0.5 rounded">{ev}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-500">
                    <span>{wh.delivery_count} deliveries</span>
                    {wh.last_status && (
                      <span className="flex items-center gap-1">
                        {wh.last_status < 300 ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                        Last: {wh.last_status}
                      </span>
                    )}
                    {wh.last_triggered_at && (
                      <span>Last fired: {new Date(wh.last_triggered_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleTest(wh.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="Send test">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleToggle(wh)} className="text-navy-500 hover:text-white transition-colors">
                    {wh.is_active ? <ToggleRight className="w-5 h-5 text-accent-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete(wh.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create webhook modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Webhook</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Endpoint URL *</Label>
              <Input
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://hooks.zapier.com/..."
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Secret (optional, sent in X-Aryanka-Secret header)</Label>
              <Input
                value={form.secret}
                onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                placeholder="Your secret key for verification"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Events to fire on *</Label>
              <div className="mt-2 space-y-2">
                {ALL_EVENTS.map((ev) => (
                  <label key={ev.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.events.includes(ev.value)}
                      onChange={() => toggleEvent(ev.value)}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <div>
                      <div className="text-sm text-white">{ev.label}</div>
                      <div className="text-xs text-navy-500">{ev.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
