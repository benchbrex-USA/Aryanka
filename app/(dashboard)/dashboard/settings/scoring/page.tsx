'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Zap, Trash2, Loader2, TrendingUp, TrendingDown, ToggleLeft, ToggleRight } from 'lucide-react';

interface ScoringRule {
  id: string;
  name: string;
  trigger_event: string;
  trigger_value: string | null;
  points: number;
  is_active: boolean;
}

const TRIGGER_OPTIONS = [
  { value: 'email_opened', label: 'Email Opened', suggested: 15 },
  { value: 'email_clicked', label: 'Email Link Clicked', suggested: 25 },
  { value: 'form_submitted', label: 'Form Submitted', suggested: 30 },
  { value: 'demo_booked', label: 'Demo Booked', suggested: 50 },
  { value: 'lead_status_changed', label: 'Status Changed To...', suggested: 10 },
  { value: 'source_is', label: 'Source Is...', suggested: 20 },
  { value: 'unsubscribed', label: 'Unsubscribed', suggested: -50 },
  { value: 'email_bounced', label: 'Email Bounced', suggested: -30 },
];

const DEFAULT_RULES = [
  { name: 'Work email signup', trigger_event: 'form_submitted', trigger_value: null, points: 20 },
  { name: 'Email opened', trigger_event: 'email_opened', trigger_value: null, points: 15 },
  { name: 'Link clicked', trigger_event: 'email_clicked', trigger_value: null, points: 25 },
  { name: 'Demo booked', trigger_event: 'demo_booked', trigger_value: null, points: 50 },
  { name: 'Unsubscribed', trigger_event: 'unsubscribed', trigger_value: null, points: -50 },
  { name: 'LinkedIn source', trigger_event: 'source_is', trigger_value: 'linkedin', points: 20 },
];

export default function ScoringRulesPage() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_event: 'email_opened', trigger_value: '', points: '15' });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/scoring');
    if (res.ok) {
      const d = await res.json();
      setRules(d.rules || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          trigger_event: form.trigger_event,
          trigger_value: form.trigger_value || null,
          points: parseInt(form.points),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Rule created!' });
      setOpen(false);
      setForm({ name: '', trigger_event: 'email_opened', trigger_value: '', points: '15' });
      fetchRules();
    } catch {
      toast({ title: 'Failed to create rule', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ScoringRule) => {
    await fetch('/api/scoring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }),
    });
    fetchRules();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/scoring', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Rule deleted' });
  };

  const loadDefaults = async () => {
    setSaving(true);
    for (const rule of DEFAULT_RULES) {
      await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
    }
    await fetchRules();
    setSaving(false);
    toast({ title: '6 default rules loaded!' });
  };

  const getTriggerLabel = (event: string) =>
    TRIGGER_OPTIONS.find((t) => t.value === event)?.label || event;

  const setFormTrigger = (event: string) => {
    const suggested = TRIGGER_OPTIONS.find((t) => t.value === event)?.suggested || 15;
    setForm((f) => ({ ...f, trigger_event: event, points: String(suggested) }));
  };

  const positiveRules = rules.filter((r) => r.points > 0 && r.is_active);
  const negativeRules = rules.filter((r) => r.points < 0 && r.is_active);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Scoring Rules</h1>
          <p className="text-navy-400 text-sm mt-1">Automatically adjust lead scores based on behavior</p>
        </div>
        <div className="flex gap-2">
          {rules.length === 0 && (
            <Button variant="outline" size="sm" onClick={loadDefaults} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Load Defaults
            </Button>
          )}
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> New Rule
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Rules', value: rules.length, icon: Zap, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Positive Events', value: positiveRules.length, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Negative Events', value: negativeRules.length, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-navy-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : rules.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Zap className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No scoring rules yet. Lead scores are manually set.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={loadDefaults}>Load 6 Default Rules</Button>
            <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Custom Rule</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-glass rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                rule.points > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {rule.points > 0 ? '+' : ''}{rule.points}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{rule.name}</div>
                <div className="text-xs text-navy-400">
                  Trigger: {getTriggerLabel(rule.trigger_event)}
                  {rule.trigger_value && ` = "${rule.trigger_value}"`}
                </div>
              </div>
              <Badge variant={rule.is_active ? 'success' : 'secondary'} className="text-xs">
                {rule.is_active ? 'Active' : 'Paused'}
              </Badge>
              <button onClick={() => handleToggle(rule)} className="text-navy-500 hover:text-white transition-colors">
                {rule.is_active ? <ToggleRight className="w-5 h-5 text-accent-400" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">How Scoring Works</h3>
        <div className="text-xs text-navy-400 space-y-1">
          <p>• Rules fire automatically when the trigger event occurs for any lead</p>
          <p>• Points are added or subtracted from the lead&apos;s current score</p>
          <p>• Score is capped between 0–100</p>
          <p>• Score history is logged on each lead&apos;s record</p>
        </div>
      </div>

      {/* Create Rule Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Scoring Rule</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Rule Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Demo booked"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Trigger Event *</Label>
              <select
                value={form.trigger_event}
                onChange={(e) => setFormTrigger(e.target.value)}
                className="mt-1 w-full bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              >
                {TRIGGER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {(form.trigger_event === 'lead_status_changed' || form.trigger_event === 'source_is') && (
              <div>
                <Label>Trigger Value</Label>
                <Input
                  value={form.trigger_value}
                  onChange={(e) => setForm((f) => ({ ...f, trigger_value: e.target.value }))}
                  placeholder={form.trigger_event === 'source_is' ? 'linkedin, google, etc.' : 'qualified, won, etc.'}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label>Points (positive = add, negative = subtract)</Label>
              <Input
                type="number"
                value={form.points}
                onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                placeholder="e.g. 25 or -50"
                required
                className="mt-1"
              />
              <p className="text-xs text-navy-500 mt-1">
                Range: -100 to +100. Score stays within 0–100.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
