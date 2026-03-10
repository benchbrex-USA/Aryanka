'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Users, Loader2, Search, Download, Trash2, Mail, Tag } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string;
  tags: string[];
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', source: 'direct', tags: '' });

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, limit: '100' });
    const res = await fetch(`/api/subscribers?${params}`);
    if (res.ok) {
      const d = await res.json();
      setSubscribers(d.subscribers || []);
      setTotal(d.total || 0);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const filtered = subscribers.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.email.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q);
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Subscriber added!' });
      setAddOpen(false);
      setForm({ email: '', name: '', source: 'direct', tags: '' });
      fetchSubscribers();
    } catch {
      toast({ title: 'Failed to add subscriber', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribe = async (email: string) => {
    await fetch('/api/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    fetchSubscribers();
    toast({ title: 'Subscriber unsubscribed' });
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast({ title: 'Subscriber removed' });
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Source', 'Status', 'Tags', 'Subscribed'],
      ...filtered.map((s) => [s.name || '', s.email, s.source, s.status, s.tags.join('|'), s.subscribed_at.split('T')[0]]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscribers</h1>
          <p className="text-navy-400 text-sm mt-1">Manage your newsletter audience separately from leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4" />Export CSV</Button>
          <Button variant="gradient" size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Add Subscriber</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Active', value: activeCount, color: 'text-green-400' },
          { label: 'Unsubscribed', value: unsubCount, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-glass rounded-xl p-5">
            <div className="text-xs text-navy-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-1">
          {['active', 'unsubscribed', 'bounced'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-navy-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400 text-sm">No subscribers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Subscriber', 'Source', 'Tags', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white text-sm">{s.name || 'Anonymous'}</div>
                      <div className="text-xs text-navy-500">{s.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300 capitalize">{s.source}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-accent-500/10 text-accent-400 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={s.status === 'active' ? 'success' : s.status === 'unsubscribed' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-navy-500">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {s.status === 'active' && (
                          <button onClick={() => handleUnsubscribe(s.email)} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-navy-400 hover:text-yellow-400 transition-colors" title="Unsubscribe">
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors" title="Delete">
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

      {/* Add Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Subscriber</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="subscriber@example.com" required className="mt-1" />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className="mt-1" />
            </div>
            <div>
              <Label>Source</Label>
              <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="mt-1 w-full bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                {['direct', 'form', 'blog', 'import', 'referral', 'other'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="newsletter, saas, early-adopter" className="mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Subscriber
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
