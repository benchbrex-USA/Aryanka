'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type Lead = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  source: string;
  status: string;
  score: number;
  notes: string | null;
  created_at: string;
};

type LeadForm = Omit<Lead, 'id' | 'created_at' | 'score'> & { score: string };

const EMPTY_FORM: LeadForm = {
  email: '',
  name: '',
  company: '',
  phone: '',
  source: 'manual',
  status: 'new',
  score: '50',
  notes: '',
};

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'purple' | 'secondary'> = {
  new: 'default',
  contacted: 'warning',
  qualified: 'success',
  proposal: 'purple',
  won: 'success',
  lost: 'destructive',
  unsubscribed: 'secondary',
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const SOURCES = ['website', 'linkedin', 'google', 'reddit', 'medium', 'twitter', 'demo', 'referral', 'manual', 'other'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch {
      toast({ title: 'Error loading leads', description: 'Check your Supabase configuration.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openAdd = () => { setEditLead(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({ email: lead.email, name: lead.name || '', company: lead.company || '', phone: lead.phone || '', source: lead.source, status: lead.status, score: String(lead.score), notes: lead.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, score: parseInt(form.score) || 50 };
      let res: Response;
      if (editLead) {
        res = await fetch(`/api/leads/${editLead.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, type: 'signup' }) });
      }
      if (!res.ok) throw new Error('Save failed');
      toast({ title: editLead ? 'Lead updated' : 'Lead added', description: editLead ? `${form.name || form.email} updated.` : `${form.name || form.email} added to CRM.` });
      setModalOpen(false);
      fetchLeads();
    } catch {
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Lead deleted' });
      setDeleteId(null);
      fetchLeads();
    } catch {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Company', 'Phone', 'Source', 'Status', 'Score', 'Date'],
      ...leads.map((l) => [l.name || '', l.email, l.company || '', l.phone || '', l.source, l.status, String(l.score), l.created_at.split('T')[0]]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aryanka-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.name || '').toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads & CRM</h1>
          <p className="text-navy-400 mt-1 text-sm">{total.toLocaleString()} total leads in pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={leads.length === 0}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="gradient" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" className="bg-navy-800">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-navy-800 capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="w-8 h-8 text-navy-600 mb-3" />
            <p className="text-sm text-navy-500">
              {search ? 'No leads match your search.' : 'No leads yet. Add your first lead or connect Supabase.'}
            </p>
            {!search && (
              <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}>
                <Plus className="w-4 h-4" /> Add Lead
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Lead', 'Company', 'Source', 'Score', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white text-sm">{lead.name || 'Anonymous'}</div>
                      <div className="text-xs text-navy-500">{lead.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-navy-300">{lead.company || '—'}</div>
                      {lead.phone && <div className="text-xs text-navy-500">{lead.phone}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300 capitalize">{lead.source}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-navy-700 rounded-full">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANTS[lead.status] || 'secondary'} className="capitalize">
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-navy-500 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(lead.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors" title="Delete">
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-xs text-navy-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead-name">Full Name</Label>
                <Input id="lead-name" value={form.name || ''} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Mehta" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lead-email">Email *</Label>
                <Input id="lead-email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rahul@company.com" required className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead-company">Company</Label>
                <Input id="lead-company" value={form.company || ''} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lead-phone">Phone</Label>
                <Input id="lead-phone" value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead-source">Source</Label>
                <select id="lead-source" value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))} className="mt-1 flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {SOURCES.map((s) => <option key={s} value={s} className="bg-navy-800 capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="lead-status">Status</Label>
                <select id="lead-status" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-navy-800 capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="lead-score">Lead Score (0–100): {form.score}</Label>
              <input id="lead-score" type="range" min="0" max="100" value={form.score} onChange={(e) => setForm(f => ({ ...f, score: e.target.value }))} className="mt-2 w-full accent-brand-500" />
            </div>
            <div>
              <Label htmlFor="lead-notes">Notes</Label>
              <Textarea id="lead-notes" value={form.notes || ''} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add any notes about this lead..." className="mt-1" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editLead ? 'Save Changes' : 'Add Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lead?</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-navy-300">This action cannot be undone. The lead will be permanently removed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
