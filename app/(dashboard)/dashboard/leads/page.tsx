'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '@/components/ui/dialog';
import {
  Search, Filter, Download, Plus, Pencil, Trash2, Loader2,
  Users, AlertCircle, Sparkles, CheckCircle2, Upload,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type Lead = {
  id: string; email: string; name: string | null; company: string | null;
  phone: string | null; source: string; status: string; score: number;
  notes: string | null; created_at: string; enriched_at?: string | null;
  email_verified?: boolean | null; company_industry?: string | null; company_size?: string | null;
};

type LeadForm = Omit<Lead, 'id' | 'created_at' | 'score'> & { score: string };

const EMPTY_FORM: LeadForm = {
  email: '', name: '', company: '', phone: '', source: 'manual',
  status: 'new', score: '50', notes: '',
};

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'purple' | 'secondary'> = {
  new: 'default', contacted: 'warning', qualified: 'success',
  proposal: 'purple', won: 'success', lost: 'destructive', unsubscribed: 'secondary',
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const SOURCES  = ['website', 'linkedin', 'google', 'reddit', 'medium', 'twitter', 'demo', 'referral', 'manual', 'other'];

const selectCls = [
  'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
  'bg-[#111111] text-[#ededed] border border-white/[0.08]',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
  'hover:border-white/[0.12] transition-colors duration-150',
  '[&>option]:bg-[#1a1a1a]',
].join(' ');

export default function LeadsPage() {
  const [leads,        setLeads]        = useState<Lead[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [editLead,     setEditLead]     = useState<Lead | null>(null);
  const [form,         setForm]         = useState<LeadForm>(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [enrichingId,  setEnrichingId]  = useState<string | null>(null);
  const [bulkEnriching,setBulkEnriching]= useState(false);
  const LIMIT = 20;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set('status', statusFilter);
      const res  = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch {
      toast({ title: 'Error loading leads', description: 'Check your Supabase configuration.', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openAdd  = () => { setEditLead(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({ email: lead.email, name: lead.name || '', company: lead.company || '', phone: lead.phone || '', source: lead.source, status: lead.status, score: String(lead.score), notes: lead.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...form, score: parseInt(form.score) || 50 };
      const res  = editLead
        ? await fetch(`/api/leads/${editLead.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, type: 'signup' }) });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: editLead ? 'Lead updated' : 'Lead added', variant: 'success' });
      setModalOpen(false); fetchLeads();
    } catch { toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' }); }
    finally  { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Lead deleted' }); setDeleteId(null); fetchLeads();
    } catch { toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' }); }
    finally  { setDeleting(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['Name','Email','Company','Phone','Source','Status','Score','Date'],
      ...leads.map((l) => [l.name||'', l.email, l.company||'', l.phone||'', l.source, l.status, String(l.score), l.created_at.split('T')[0]]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'aryanka-leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnrich = async (lead: Lead) => {
    setEnrichingId(lead.id);
    try {
      const res = await fetch('/api/leads/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: lead.id }) });
      if (res.ok) { toast({ title: 'Lead enriched!', variant: 'success' }); fetchLeads(); }
      else         toast({ title: 'Enrichment failed', variant: 'destructive' });
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally  { setEnrichingId(null); }
  };

  const handleBulkEnrich = async () => {
    setBulkEnriching(true);
    try {
      const res = await fetch('/api/leads/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bulk: true }) });
      if (res.ok) { const d = await res.json(); toast({ title: `Enriched ${d.enriched} leads!`, variant: 'success' }); fetchLeads(); }
      else         toast({ title: 'Bulk enrichment failed', variant: 'destructive' });
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally  { setBulkEnriching(false); }
  };

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.name||'').toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company||'').toLowerCase().includes(q);
  });

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#ededed] tracking-tight">Leads & CRM</h1>
          <p className="text-xs text-[#555] mt-0.5">{total.toLocaleString()} leads in pipeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="ghost" size="sm" onClick={exportCSV} disabled={leads.length === 0}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Link href="/dashboard/leads/import">
            <Button variant="ghost" size="sm"><Upload className="w-3.5 h-3.5" /> Import</Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleBulkEnrich} disabled={bulkEnriching}>
            {bulkEnriching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-400" />}
            Bulk Enrich
          </Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5" /> Add Lead</Button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text" placeholder="Search leads…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-[#ededed] placeholder:text-[#444] focus:outline-none focus:ring-2 focus:ring-brand-500/50 hover:border-white/[0.12] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#444]" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls} style={{ width: 'auto' }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table card ─────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#444]" />
            </div>
            <p className="text-sm font-medium text-[#555] mb-1">
              {search ? 'No leads match your search' : 'No leads yet'}
            </p>
            <p className="text-xs text-[#444] mb-4">
              {search ? 'Try a different search term' : 'Add your first lead or connect Supabase to import data.'}
            </p>
            {!search && (
              <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5" /> Add Lead</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Lead', 'Company', 'Source', 'Score', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} className={cn('group hover:bg-white/[0.025] transition-colors', i !== filtered.length - 1 && 'border-b border-white/[0.04]')}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-[#666] flex-shrink-0">
                          {((lead.name)?.[0] || lead.email?.[0] || 'A').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#ededed] truncate">{lead.name || 'Anonymous'}</div>
                          <div className="text-xs text-[#555] truncate">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-[#777]">{lead.company || <span className="text-[#444]">—</span>}</div>
                      {lead.phone && <div className="text-xs text-[#555]">{lead.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-white/[0.04] text-[#666] border border-white/[0.06] capitalize">{lead.source}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-1 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${Math.max(2, lead.score)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-[#777] tabular-nums w-5">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_VARIANTS[lead.status] || 'secondary'} className="capitalize">{lead.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#555] whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEnrich(lead)} disabled={enrichingId === lead.id}
                          className="p-1.5 rounded-lg hover:bg-brand-500/[0.1] text-[#444] hover:text-brand-400 transition-colors" title="Enrich">
                          {enrichingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : lead.enriched_at ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#444] hover:text-[#ededed] transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(lead.id)} className="p-1.5 rounded-lg hover:bg-red-500/[0.1] text-[#444] hover:text-red-400 transition-colors" title="Delete">
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

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="text-xs text-[#555]">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ───────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Full Name</Label>
                  <Input id="lead-name" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Rahul Mehta" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-email">Email *</Label>
                  <Input id="lead-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="rahul@company.com" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-company">Company</Label>
                  <Input id="lead-company" value={form.company || ''} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input id="lead-phone" value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-source">Source</Label>
                  <select id="lead-source" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className={selectCls}>
                    {SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-status">Status</Label>
                  <select id="lead-status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={selectCls}>
                    {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-score">Lead Score — <span className="text-[#ededed] font-semibold">{form.score}</span></Label>
                <input id="lead-score" type="range" min="0" max="100" value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} className="w-full accent-brand-500 cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-notes">Notes</Label>
                <Textarea id="lead-notes" value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Add notes about this lead…" rows={3} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editLead ? 'Save Changes' : 'Add Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ─────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Lead?</DialogTitle></DialogHeader>
          <DialogBody>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/[0.06] border border-red-500/[0.15]">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#a1a1a1]">This action cannot be undone. The lead will be permanently removed from your database.</p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
