'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Mail, MailOpen, MousePointerClick, TrendingUp, Send, Pause, Play, Loader2, Eye, Trash2, Users } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'active';
  audience: string;
  recipients_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  openRate: string;
  ctr: string;
  sent_at: string | null;
  created_at: string;
}

interface Summary {
  totalSent: number;
  avgOpenRate: string;
  avgCtr: string;
  totalSent_raw?: number;
}

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning' | 'secondary'> = {
  active: 'success', sent: 'default', paused: 'warning', draft: 'secondary', sending: 'default', scheduled: 'default',
};

const defaultForm = { name: '', subject: '', body: '', audience: 'all_leads' as const };

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalSent: 0, avgOpenRate: '—', avgCtr: '—' });
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState<Campaign | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/campaigns');
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setSummary(data.summary || { totalSent: 0, avgOpenRate: '—', avgCtr: '—' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({ title: 'Failed to create campaign', description: data.error || 'Try again', variant: 'destructive' });
    } else {
      toast({ title: 'Campaign created!', description: `"${form.name}" is ready to send.` });
      setNewOpen(false);
      setForm(defaultForm);
      fetchCampaigns();
    }
    setSaving(false);
  };

  const sendNow = async (id: string) => {
    setActionLoading(`send-${id}`);
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', id }),
    });
    const data = await res.json();
    setActionLoading(null);
    if (!res.ok) {
      toast({ title: 'Send failed', description: data.error || 'Try again', variant: 'destructive' });
    } else {
      toast({ title: '🚀 Campaign sent!', description: `${data.sent} emails delivered.` });
      fetchCampaigns();
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    setActionLoading(id);
    const newStatus = current === 'active' ? 'paused' : 'active';
    const res = await fetch('/api/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setActionLoading(null);
    if (res.ok) {
      toast({ title: newStatus === 'active' ? 'Campaign resumed' : 'Campaign paused' });
      fetchCampaigns();
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch('/api/campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchCampaigns();
  };

  const metrics = [
    { icon: Mail, label: 'Total Sent', value: summary.totalSent.toLocaleString(), color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: MailOpen, label: 'Avg Open Rate', value: summary.avgOpenRate, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { icon: MousePointerClick, label: 'Avg CTR', value: summary.avgCtr, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: TrendingUp, label: 'Campaigns', value: campaigns.length.toString(), color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-navy-400 mt-1 text-sm">Automated nurture sequences — powered by Resend</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-navy-500">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="bg-glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">All Campaigns ({campaigns.length})</h2>
          <span className="text-xs text-navy-500">Pro: 5K emails/month via Resend</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-brand-400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="w-10 h-10 text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400 text-sm mb-4">No campaigns yet. Create your first email campaign.</p>
            <Button variant="gradient" size="sm" onClick={() => setNewOpen(true)}><Plus className="w-4 h-4" />Create Campaign</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Campaign', 'Audience', 'Sent', 'Open Rate', 'CTR', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white text-sm">{c.name}</div>
                      <div className="text-xs text-navy-500 mt-0.5 truncate max-w-[180px]">{c.subject}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-navy-400">
                        <Users className="w-3 h-3" />
                        {c.audience.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300">{c.sent_count.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm font-medium text-accent-400">{c.openRate}</td>
                    <td className="px-5 py-4 text-sm font-medium text-brand-400">{c.ctr}</td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[c.status] || 'secondary'} className="capitalize">{c.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewOpen(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {c.status === 'draft' && (
                          <button onClick={() => sendNow(c.id)} disabled={actionLoading === `send-${c.id}`} className="p-1.5 rounded-lg hover:bg-brand-500/20 text-navy-400 hover:text-brand-400 transition-colors" title="Send Now">
                            {actionLoading === `send-${c.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {(c.status === 'active' || c.status === 'paused') && (
                          <button onClick={() => toggleStatus(c.id, c.status)} disabled={actionLoading === c.id} className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-navy-400 hover:text-yellow-400 transition-colors" title={c.status === 'active' ? 'Pause' : 'Resume'}>
                            {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : c.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-navy-400 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Sequence" required className="mt-1" />
            </div>
            <div>
              <Label>Email Subject *</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Welcome to Aryanka — your growth starts now" required className="mt-1" />
            </div>
            <div>
              <Label>Audience</Label>
              <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as typeof form.audience }))} className="mt-1 w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="all_leads">All leads</option>
                <option value="qualified_leads">Qualified leads only</option>
                <option value="new_leads">New leads only</option>
              </select>
            </div>
            <div>
              <Label>Email Body *</Label>
              <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Write your email content here..." rows={6} required className="mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewOpen} onOpenChange={() => setPreviewOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Campaign — {previewOpen?.name}</DialogTitle></DialogHeader>
          {previewOpen && (
            <div className="space-y-3 text-sm">
              <div><span className="text-navy-500">Subject:</span> <span className="text-white ml-2">{previewOpen.subject}</span></div>
              <div><span className="text-navy-500">Sent:</span> <span className="text-white ml-2">{previewOpen.sent_count.toLocaleString()}</span></div>
              <div><span className="text-navy-500">Open Rate:</span> <span className="text-accent-400 ml-2">{previewOpen.openRate}</span></div>
              <div><span className="text-navy-500">CTR:</span> <span className="text-brand-400 ml-2">{previewOpen.ctr}</span></div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-navy-500 text-xs mb-2">Body preview:</p>
                <p className="text-navy-300 text-sm leading-relaxed whitespace-pre-wrap">{previewOpen.body?.slice(0, 300)}{(previewOpen.body?.length || 0) > 300 ? '...' : ''}</p>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewOpen(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
