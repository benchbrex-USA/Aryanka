'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Users, Filter, Trash2, Loader2, RefreshCw, TrendingUp } from 'lucide-react';

interface SegmentFilter {
  field: string;
  op: string;
  value: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  filters: SegmentFilter[];
  lead_count: number;
  created_at: string;
}

const FILTER_FIELDS = [
  { value: 'status', label: 'Lead Status' },
  { value: 'source', label: 'Lead Source' },
  { value: 'score_gte', label: 'Score ≥' },
  { value: 'score_lte', label: 'Score ≤' },
  { value: 'company_industry', label: 'Industry contains' },
  { value: 'company_size', label: 'Company Size' },
];

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const SOURCE_OPTIONS = ['website', 'linkedin', 'google', 'reddit', 'medium', 'twitter', 'demo', 'referral'];

const DEFAULT_SEGMENTS = [
  { name: 'Hot Leads', description: 'High score leads ready to convert', filters: [{ field: 'score_gte', op: 'gte', value: '70' }, { field: 'status', op: 'eq', value: 'qualified' }] },
  { name: 'Cold Outreach Targets', description: 'New leads not yet contacted', filters: [{ field: 'status', op: 'eq', value: 'new' }, { field: 'score_gte', op: 'gte', value: '40' }] },
  { name: 'LinkedIn Leads', description: 'All leads from LinkedIn', filters: [{ field: 'source', op: 'eq', value: 'linkedin' }] },
  { name: 'Enterprise Prospects', description: 'Large company leads', filters: [{ field: 'company_size', op: 'eq', value: '201-500' }] },
];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    filters: [{ field: 'status', op: 'eq', value: 'qualified' }] as SegmentFilter[],
  });

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/segments');
    if (res.ok) {
      const d = await res.json();
      setSegments(d.segments || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSegments(); }, [fetchSegments]);

  const addFilter = () => setForm((f) => ({ ...f, filters: [...f.filters, { field: 'status', op: 'eq', value: 'new' }] }));
  const removeFilter = (i: number) => setForm((f) => ({ ...f, filters: f.filters.filter((_, idx) => idx !== i) }));
  const updateFilter = (i: number, updates: Partial<SegmentFilter>) =>
    setForm((f) => ({ ...f, filters: f.filters.map((filter, idx) => idx === i ? { ...filter, ...updates } : filter) }));

  const previewSegment = async () => {
    setPreviewing(true);
    const res = await fetch('/api/segments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: form.filters }),
    });
    if (res.ok) {
      const d = await res.json();
      setPreviewCount(d.count);
    }
    setPreviewing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Segment created!' });
      setOpen(false);
      fetchSegments();
    } catch {
      toast({ title: 'Failed to create segment', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/segments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSegments((prev) => prev.filter((s) => s.id !== id));
    toast({ title: 'Segment deleted' });
  };

  const loadDefault = (preset: typeof DEFAULT_SEGMENTS[0]) => {
    setForm({ name: preset.name, description: preset.description, filters: preset.filters });
    setOpen(true);
    setPreviewCount(null);
  };

  const getFieldValueInput = (filter: SegmentFilter, i: number) => {
    if (filter.field === 'status') {
      return (
        <select value={filter.value} onChange={(e) => updateFilter(i, { value: e.target.value })} className="bg-navy-800 border border-white/10 rounded px-2 py-1 text-xs text-white flex-1">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      );
    }
    if (filter.field === 'source') {
      return (
        <select value={filter.value} onChange={(e) => updateFilter(i, { value: e.target.value })} className="bg-navy-800 border border-white/10 rounded px-2 py-1 text-xs text-white flex-1">
          {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      );
    }
    return (
      <Input value={filter.value} onChange={(e) => updateFilter(i, { value: e.target.value })} placeholder="Value..." className="h-7 text-xs flex-1" />
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience Segments</h1>
          <p className="text-navy-400 text-sm mt-1">Filter leads by behavior and attributes for targeted campaigns</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => { setForm({ name: '', description: '', filters: [{ field: 'status', op: 'eq', value: 'qualified' }] }); setPreviewCount(null); setOpen(true); }}>
          <Plus className="w-4 h-4" /> New Segment
        </Button>
      </div>

      {/* Preset segments */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Quick Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEFAULT_SEGMENTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadDefault(preset)}
              className="bg-glass rounded-xl p-3 text-left hover:border-brand-500/40 border border-white/10 transition-all"
            >
              <div className="text-sm font-medium text-white mb-1">{preset.name}</div>
              <div className="text-xs text-navy-400">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : segments.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Filter className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm">No segments yet. Create your first audience segment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <div key={seg.id} className="bg-glass rounded-xl border border-white/10 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1">{seg.name}</h3>
                  {seg.description && <p className="text-xs text-navy-400">{seg.description}</p>}
                </div>
                <button onClick={() => handleDelete(seg.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-navy-400 mb-3">
                <TrendingUp className="w-3 h-3 text-brand-400" />
                <span className="text-white font-medium">{seg.lead_count}</span> matching leads
              </div>

              <div className="space-y-1 mb-3">
                {seg.filters.slice(0, 3).map((f, i) => (
                  <div key={i} className="text-xs bg-white/3 rounded px-2 py-1 text-navy-300">
                    {FILTER_FIELDS.find((ff) => ff.value === f.field)?.label || f.field}: <strong>{f.value}</strong>
                  </div>
                ))}
                {seg.filters.length > 3 && <div className="text-xs text-navy-500">+{seg.filters.length - 3} more filters</div>}
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs">
                <Users className="w-3 h-3" /> Use in Campaign
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Segment Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Segment</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Segment Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Hot LinkedIn Leads" required className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What this segment represents..." className="mt-1" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Filters</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFilter}><Plus className="w-3 h-3" />Add Filter</Button>
              </div>
              <div className="space-y-2">
                {form.filters.map((filter, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/3 rounded-xl">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(i, { field: e.target.value })}
                      className="bg-navy-800 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      {FILTER_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    {getFieldValueInput(filter, i)}
                    <button type="button" onClick={() => removeFilter(i)} className="text-navy-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
              <Button type="button" variant="outline" size="sm" onClick={previewSegment} disabled={previewing}>
                {previewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Preview Size
              </Button>
              {previewCount !== null && (
                <span className="text-sm text-white font-medium">{previewCount} leads match these filters</span>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Segment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
