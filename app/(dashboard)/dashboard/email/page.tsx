'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Mail, MailOpen, MousePointerClick, TrendingUp,
  Send, Pause, Play, Loader2, Eye, Trash2, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string; name: string; subject: string; body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'active';
  audience: string; recipients_count: number; sent_count: number;
  opened_count: number; clicked_count: number; openRate: string; ctr: string;
  sent_at: string | null; created_at: string;
}

interface Summary { totalSent: number; avgOpenRate: string; avgCtr: string; }

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning' | 'secondary'> = {
  active: 'success', sent: 'default', paused: 'warning',
  draft: 'secondary', sending: 'default', scheduled: 'default',
};

const defaultForm = { name: '', subject: '', body: '', audience: 'all_leads' as const };

const selectCls = [
  'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
  'bg-[#111111] text-[#ededed] border border-white/[0.08]',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
  'hover:border-white/[0.12] transition-colors [&>option]:bg-[#1a1a1a]',
].join(' ');

export default function EmailPage() {
  const [campaigns,     setCampaigns]     = useState<Campaign[]>([]);
  const [summary,       setSummary]       = useState<Summary>({ totalSent: 0, avgOpenRate: '—', avgCtr: '—' });
  const [loading,       setLoading]       = useState(true);
  const [newOpen,       setNewOpen]       = useState(false);
  const [previewOpen,   setPreviewOpen]   = useState<Campaign | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [form,          setForm]          = useState(defaultForm);

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
    e.preventDefault(); setSaving(true);
    const res  = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) {
      toast({ title: 'Failed to create campaign', description: data.error || 'Try again', variant: 'destructive' });
    } else {
      toast({ title: 'Campaign created!', description: `"${form.name}" is ready to send.`, variant: 'success' });
      setNewOpen(false); setForm(defaultForm); fetchCampaigns();
    }
    setSaving(false);
  };

  const sendNow = async (id: string) => {
    setActionLoading(`send-${id}`);
    const res  = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', id }) });
    const data = await res.json();
    setActionLoading(null);
    if (!res.ok) toast({ title: 'Send failed', description: data.error || 'Try again', variant: 'destructive' });
    else { toast({ title: 'Campaign sent!', description: `${data.sent} emails delivered.`, variant: 'success' }); fetchCampaigns(); }
  };

  const toggleStatus = async (id: string, current: string) => {
    setActionLoading(id);
    const newStatus = current === 'active' ? 'paused' : 'active';
    const res = await fetch('/api/campaigns', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: newStatus }) });
    setActionLoading(null);
    if (res.ok) { toast({ title: newStatus === 'active' ? 'Campaign resumed' : 'Campaign paused' }); fetchCampaigns(); }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch('/api/campaigns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchCampaigns();
  };

  const metrics = [
    { icon: Mail,              label: 'Total Sent',    value: summary.totalSent.toLocaleString(), color: 'text-brand-400', bg: 'bg-brand-500/[0.12]' },
    { icon: MailOpen,          label: 'Avg Open Rate', value: summary.avgOpenRate,                color: 'text-accent-400', bg: 'bg-accent-500/[0.12]' },
    { icon: MousePointerClick, label: 'Avg CTR',       value: summary.avgCtr,                    color: 'text-purple-400', bg: 'bg-purple-500/[0.12]' },
    { icon: TrendingUp,        label: 'Campaigns',     value: campaigns.length.toString(),        color: 'text-yellow-400', bg: 'bg-yellow-500/[0.12]' },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">Email Campaigns</h1>
          <p className="text-xs text-[#555] mt-0.5">Automated nurture sequences · powered by Resend</p>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="w-3.5 h-3.5" /> New Campaign</Button>
      </div>

      {/* ── Metric cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.07] bg-[#111] p-5 flex flex-col gap-3 hover:border-white/[0.11] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#555]">{m.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', m.bg)}>
                <m.icon className={cn('w-4 h-4', m.color)} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#ededed] tracking-tight tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Campaigns table ────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">All Campaigns</h2>
            <p className="text-xs text-[#555] mt-0.5">{campaigns.length} total · Pro: 5K emails/month via Resend</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-brand-400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-[#444]" />
            </div>
            <p className="text-sm font-medium text-[#555] mb-1">No campaigns yet</p>
            <p className="text-xs text-[#444] mb-4">Create your first email campaign to start reaching leads.</p>
            <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="w-3.5 h-3.5" /> Create Campaign</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Campaign', 'Audience', 'Sent', 'Open Rate', 'CTR', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id} className={cn('group hover:bg-white/[0.025] transition-colors', i !== campaigns.length - 1 && 'border-b border-white/[0.04]')}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-sm text-[#ededed]">{c.name}</div>
                      <div className="text-xs text-[#555] mt-0.5 truncate max-w-[180px]">{c.subject}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#666]">
                        <Users className="w-3 h-3" /> {c.audience.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#777] tabular-nums">{c.sent_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-accent-400 tabular-nums">{c.openRate}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-brand-400 tabular-nums">{c.ctr}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_VARIANT[c.status] || 'secondary'} className="capitalize">{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewOpen(c)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#444] hover:text-[#ededed] transition-colors" title="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {c.status === 'draft' && (
                          <button onClick={() => sendNow(c.id)} disabled={actionLoading === `send-${c.id}`} className="p-1.5 rounded-lg hover:bg-brand-500/[0.1] text-[#444] hover:text-brand-400 transition-colors" title="Send Now">
                            {actionLoading === `send-${c.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {(c.status === 'active' || c.status === 'paused') && (
                          <button onClick={() => toggleStatus(c.id, c.status)} disabled={actionLoading === c.id} className="p-1.5 rounded-lg hover:bg-yellow-500/[0.1] text-[#444] hover:text-yellow-400 transition-colors">
                            {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : c.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/[0.1] text-[#444] hover:text-red-400 transition-colors" title="Delete">
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

      {/* ── Create modal ───────────────────────────────────── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label>Campaign Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Sequence" required />
              </div>
              <div className="space-y-1.5">
                <Label>Email Subject *</Label>
                <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Welcome to Aryanka — your growth starts now" required />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as typeof form.audience }))} className={selectCls}>
                  <option value="all_leads">All leads</option>
                  <option value="qualified_leads">Qualified leads only</option>
                  <option value="new_leads">New leads only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Email Body *</Label>
                <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Write your email content here…" rows={6} required />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNewOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Preview modal ──────────────────────────────────── */}
      <Dialog open={!!previewOpen} onOpenChange={() => setPreviewOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{previewOpen?.name}</DialogTitle></DialogHeader>
          {previewOpen && (
            <DialogBody className="space-y-3 text-sm">
              <div className="space-y-2">
                {[
                  { label: 'Subject',   value: previewOpen.subject,                     cls: 'text-[#ededed]' },
                  { label: 'Sent',      value: previewOpen.sent_count.toLocaleString(), cls: 'text-[#ededed] tabular-nums' },
                  { label: 'Open Rate', value: previewOpen.openRate,                    cls: 'text-accent-400 font-medium' },
                  { label: 'CTR',       value: previewOpen.ctr,                         cls: 'text-brand-400 font-medium' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <span className="text-[#555] text-xs">{label}</span>
                    <span className={cn('text-sm text-right', cls)}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-[#555] mb-2">Body preview</p>
                <p className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap">
                  {previewOpen.body?.slice(0, 300)}{(previewOpen.body?.length || 0) > 300 ? '…' : ''}
                </p>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewOpen(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
