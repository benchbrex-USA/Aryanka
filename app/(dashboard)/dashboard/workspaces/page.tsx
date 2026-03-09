'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Globe, Trash2, Loader2, Edit2, CheckCircle } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  domain?: string;
  slug: string;
  logo_url?: string;
  is_default: boolean;
  plan: string;
  created_at: string;
}

const emptyForm = { name: '', domain: '', slug: '', logo_url: '' };

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Workspace | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/workspaces');
    if (res.ok) {
      const { workspaces: data } = await res.json();
      setWorkspaces(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (ws: Workspace) => {
    setEditing(ws);
    setForm({ name: ws.name, domain: ws.domain || '', slug: ws.slug, logo_url: ws.logo_url || '' });
    setOpen(true);
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/workspaces', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: editing ? 'Workspace updated' : 'Workspace created!' });
      setOpen(false);
      fetchWorkspaces();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workspace? This cannot be undone.')) return;
    const res = await fetch('/api/workspaces', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast({ title: 'Workspace deleted' });
      fetchWorkspaces();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Websites & Domains</h1>
          <p className="text-navy-400 text-sm mt-1">Manage up to 5 websites or domains from one dashboard</p>
        </div>
        <Button variant="gradient" size="sm" onClick={openCreate} disabled={workspaces.length >= 5}>
          <Plus className="w-4 h-4" />
          Add Website
        </Button>
      </div>

      {/* Plan limit */}
      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-brand-300">{workspaces.length} / 5 workspaces used</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-6 h-2 rounded-full ${i < workspaces.length ? 'bg-brand-400' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : workspaces.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center border border-white/10">
          <Globe className="w-10 h-10 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No workspaces yet. Add your first website to get started.</p>
          <Button variant="gradient" size="sm" onClick={openCreate}><Plus className="w-4 h-4" />Add First Website</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces.map((ws) => (
            <div key={ws.id} className="bg-glass rounded-xl p-5 border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{ws.name}</span>
                  {ws.is_default && <Badge variant="success" className="text-xs">Default</Badge>}
                </div>
                <div className="text-xs text-navy-400 mt-0.5">
                  {ws.domain ? ws.domain : `aryanka.io/${ws.slug}`}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs capitalize">{ws.plan}</Badge>
                <button onClick={() => openEdit(ws)} className="p-1.5 rounded-lg text-navy-500 hover:text-white hover:bg-white/10 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ws.id)} className="p-1.5 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Workspace' : 'Add Workspace'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Website / Brand Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : autoSlug(e.target.value) }))}
                placeholder="My SaaS Product"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="my-saas-product"
                pattern="[a-z0-9-]+"
                required
                className="mt-1"
              />
              <p className="text-xs text-navy-500 mt-1">Lowercase letters, numbers, hyphens only</p>
            </div>
            <div>
              <Label>Custom Domain (optional)</Label>
              <Input
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                placeholder="app.myproduct.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Logo URL (optional)</Label>
              <Input
                value={form.logo_url}
                onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
