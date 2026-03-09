'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Mail, MailOpen, MousePointerClick, TrendingUp, Send, Pause, Play, Loader2, Eye } from 'lucide-react';

type Campaign = {
  id: string;
  name: string;
  subscribers: number;
  sent: number;
  opened: number;
  clicked: number;
  status: 'active' | 'sent' | 'paused' | 'draft';
  openRate: string;
  ctr: string;
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Welcome Sequence', subscribers: 892, sent: 2847, opened: 1203, clicked: 341, status: 'active', openRate: '42.3%', ctr: '12.0%' },
  { id: '2', name: 'B2B Nurture — Lead Gen', subscribers: 234, sent: 701, opened: 287, clicked: 89, status: 'active', openRate: '40.9%', ctr: '12.7%' },
  { id: '3', name: 'Feature Announcement — Jan', subscribers: 1247, sent: 1247, opened: 562, clicked: 187, status: 'sent', openRate: '45.1%', ctr: '15.0%' },
  { id: '4', name: 'Re-engagement Campaign', subscribers: 188, sent: 188, opened: 56, clicked: 14, status: 'paused', openRate: '29.8%', ctr: '7.4%' },
];

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning' | 'secondary'> = {
  active: 'success',
  sent: 'default',
  paused: 'warning',
  draft: 'secondary',
};

const metrics = [
  { icon: Mail, label: 'Total Sent', value: '4,983', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: MailOpen, label: 'Avg Open Rate', value: '42.3%', color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { icon: MousePointerClick, label: 'Avg CTR', value: '12.0%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: TrendingUp, label: 'Conversions', value: '187', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [newOpen, setNewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });

  const toggleStatus = async (id: string, current: string) => {
    setActionLoading(id);
    await new Promise((r) => setTimeout(r, 800));
    const newStatus = current === 'active' ? 'paused' : current === 'paused' ? 'active' : current;
    setCampaigns((cs) => cs.map((c) => c.id === id ? { ...c, status: newStatus as Campaign['status'] } : c));
    toast({ title: newStatus === 'active' ? 'Campaign resumed' : 'Campaign paused', description: `Status updated successfully.` });
    setActionLoading(null);
  };

  const sendNow = async (id: string) => {
    setActionLoading(`send-${id}`);
    await new Promise((r) => setTimeout(r, 1200));
    setCampaigns((cs) => cs.map((c) => c.id === id ? { ...c, status: 'sent' as Campaign['status'] } : c));
    toast({ title: 'Campaign sent!', description: 'Your emails are on their way.' });
    setActionLoading(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newCampaign: Campaign = {
      id: String(Date.now()),
      name: form.name,
      subscribers: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      status: 'draft',
      openRate: '—',
      ctr: '—',
    };
    setCampaigns((cs) => [newCampaign, ...cs]);
    toast({ title: 'Campaign created!', description: `"${form.name}" is ready to configure.` });
    setNewOpen(false);
    setForm({ name: '', subject: '', body: '' });
    setSaving(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
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
          <h2 className="font-semibold text-white text-sm">All Campaigns</h2>
          <span className="text-xs text-navy-500">Free tier: 3,000 emails/month via Resend</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Campaign', 'Subscribers', 'Open Rate', 'CTR', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4 font-medium text-white text-sm">{c.name}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{c.subscribers.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-accent-400">{c.openRate}</td>
                  <td className="px-5 py-4 text-sm font-medium text-brand-400">{c.ctr}</td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[c.status] || 'secondary'} className="capitalize">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Preview */}
                      <button
                        onClick={() => { setPreviewCampaign(c); setPreviewOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Send now (draft only) */}
                      {c.status === 'draft' && (
                        <button
                          onClick={() => sendNow(c.id)}
                          disabled={actionLoading === `send-${c.id}`}
                          className="p-1.5 rounded-lg hover:bg-brand-500/20 text-navy-400 hover:text-brand-400 transition-colors"
                          title="Send Now"
                        >
                          {actionLoading === `send-${c.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Pause/Resume (active/paused) */}
                      {(c.status === 'active' || c.status === 'paused') && (
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          disabled={actionLoading === c.id}
                          className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-navy-400 hover:text-yellow-400 transition-colors"
                          title={c.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {actionLoading === c.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : c.status === 'active'
                            ? <Pause className="w-3.5 h-3.5" />
                            : <Play className="w-3.5 h-3.5" />
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Campaign Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="camp-name">Campaign Name *</Label>
              <Input id="camp-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Sequence" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="camp-subject">Email Subject *</Label>
              <Input id="camp-subject" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Welcome to Aryanka — your growth starts now" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="camp-body">Email Body</Label>
              <Textarea id="camp-body" value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your email content here..." rows={5} className="mt-1" />
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
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Campaign Preview</DialogTitle>
          </DialogHeader>
          {previewCampaign && (
            <div className="space-y-3 text-sm">
              <div><span className="text-navy-500">Name:</span> <span className="text-white ml-2">{previewCampaign.name}</span></div>
              <div><span className="text-navy-500">Subscribers:</span> <span className="text-white ml-2">{previewCampaign.subscribers.toLocaleString()}</span></div>
              <div><span className="text-navy-500">Emails Sent:</span> <span className="text-white ml-2">{previewCampaign.sent.toLocaleString()}</span></div>
              <div><span className="text-navy-500">Open Rate:</span> <span className="text-accent-400 ml-2">{previewCampaign.openRate}</span></div>
              <div><span className="text-navy-500">CTR:</span> <span className="text-brand-400 ml-2">{previewCampaign.ctr}</span></div>
              <div><span className="text-navy-500">Status:</span>
                <Badge variant={STATUS_VARIANT[previewCampaign.status] || 'secondary'} className="capitalize ml-2">{previewCampaign.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
