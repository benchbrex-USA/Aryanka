'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Zap, Mail, Clock, GitBranch, Trash2, Edit2, Loader2,
  Play, Pause, Users, ArrowRight, ChevronDown, ChevronUp,
} from 'lucide-react';

interface SequenceStep {
  step_type: 'email' | 'wait' | 'condition' | 'linkedin_connect' | 'linkedin_message';
  delay_hours: number;
  subject?: string;
  body?: string;
  condition_field?: string;
  condition_op?: string;
  condition_value?: string;
}

interface Sequence {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, string>;
  is_active: boolean;
  step_count: number;
  drip_sequence_steps?: { count: number }[];
  drip_enrollments?: { count: number }[];
  created_at: string;
}

const TRIGGER_OPTIONS = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'lead_status_changed', label: 'Lead Status Changed' },
  { value: 'score_threshold', label: 'Score Threshold Crossed' },
  { value: 'manual', label: 'Manual Enrollment' },
  { value: 'demo_booked', label: 'Demo Booked' },
];

const STEP_PRESETS: Record<string, SequenceStep[]> = {
  'SaaS Outbound': [
    { step_type: 'email', delay_hours: 0, subject: 'Quick question about {{company}}', body: 'Hi {{first_name}},\n\nI noticed {{company}} is...\n\nWould love to show you how Aryanka can help.\n\nBest,\n{{sender_name}}' },
    { step_type: 'wait', delay_hours: 72, body: '' },
    { step_type: 'email', delay_hours: 0, subject: 'Following up — {{company}}', body: 'Hi {{first_name}},\n\nJust following up on my last email...' },
    { step_type: 'condition', delay_hours: 0, condition_field: 'email_opened', condition_op: 'equals', condition_value: 'true' },
    { step_type: 'email', delay_hours: 48, subject: 'One last thing...', body: 'Hi {{first_name}},\n\nI\'ll keep this brief...' },
  ],
  'Welcome Nurture': [
    { step_type: 'email', delay_hours: 0, subject: 'Welcome to {{product_name}} 👋', body: 'Hi {{first_name}},\n\nThanks for signing up! Here\'s how to get started...' },
    { step_type: 'wait', delay_hours: 24, body: '' },
    { step_type: 'email', delay_hours: 0, subject: 'Your first week checklist', body: 'Hi {{first_name}},\n\nHere\'s what to do in your first week...' },
    { step_type: 'wait', delay_hours: 72, body: '' },
    { step_type: 'email', delay_hours: 0, subject: 'How is it going so far?', body: 'Hi {{first_name}},\n\nJust checking in...' },
  ],
  'Agency Pitch': [
    { step_type: 'email', delay_hours: 0, subject: 'Partnership opportunity for {{company}}', body: 'Hi {{first_name}},\n\nI work with agencies like yours to...' },
    { step_type: 'wait', delay_hours: 96, body: '' },
    { step_type: 'linkedin_connect', delay_hours: 0, body: 'Hi {{first_name}}, saw your work at {{company}} — would love to connect!' },
    { step_type: 'wait', delay_hours: 48, body: '' },
    { step_type: 'email', delay_hours: 0, subject: 'Case study: how we helped [Similar Company]', body: 'Hi {{first_name}},\n\nThought this might be relevant...' },
  ],
};

const STEP_TYPE_META = {
  email: { icon: Mail, label: 'Send Email', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  wait: { icon: Clock, label: 'Wait', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  condition: { icon: GitBranch, label: 'Condition', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  linkedin_connect: { icon: Users, label: 'LinkedIn Connect', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  linkedin_message: { icon: Mail, label: 'LinkedIn Message', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

const defaultStep = (): SequenceStep => ({
  step_type: 'email',
  delay_hours: 24,
  subject: '',
  body: '',
});

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Sequence | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger_type: 'form_submitted',
    trigger_config: {} as Record<string, string>,
    steps: [defaultStep()] as SequenceStep[],
  });

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/sequences');
    if (res.ok) {
      const d = await res.json();
      setSequences(d.sequences || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', trigger_type: 'form_submitted', trigger_config: {}, steps: [defaultStep()] });
    setExpandedSteps([0]);
    setOpen(true);
  };

  const loadPreset = (preset: string) => {
    const steps = STEP_PRESETS[preset] || [];
    setForm((f) => ({ ...f, steps, name: f.name || preset }));
    setExpandedSteps([]);
  };

  const addStep = () => {
    setForm((f) => ({ ...f, steps: [...f.steps, defaultStep()] }));
  };

  const removeStep = (i: number) => {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  };

  const updateStep = (i: number, updates: Partial<SequenceStep>) => {
    setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, ...updates } : s) }));
  };

  const toggleExpand = (i: number) => {
    setExpandedSteps((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/sequences', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: editing ? 'Sequence updated!' : 'Sequence created!' });
      setOpen(false);
      fetchSequences();
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (seq: Sequence) => {
    await fetch('/api/sequences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: seq.id, is_active: !seq.is_active }),
    });
    fetchSequences();
    toast({ title: seq.is_active ? 'Sequence paused' : 'Sequence activated' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sequence and all enrollments?')) return;
    await fetch('/api/sequences', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchSequences();
    toast({ title: 'Sequence deleted' });
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return 'Immediately';
    if (hours < 24) return `${hours}h delay`;
    return `${Math.round(hours / 24)}d delay`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Sequences</h1>
          <p className="text-navy-400 text-sm mt-1">Automated drip campaigns triggered by lead behavior</p>
        </div>
        <Button variant="gradient" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Sequence
        </Button>
      </div>

      {/* Merge tags reference */}
      <div className="bg-glass rounded-xl p-4 mb-6 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-navy-500 font-medium">Available merge tags:</span>
        {['{{first_name}}', '{{company}}', '{{email}}', '{{lead_score}}', '{{source}}'].map((tag) => (
          <code key={tag} className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded">{tag}</code>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : sequences.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Zap className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No sequences yet. Build your first automated drip campaign.</p>
          <Button variant="gradient" size="sm" onClick={openCreate}><Plus className="w-4 h-4" />Build Sequence</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq) => (
            <div key={seq.id} className="bg-glass rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{seq.name}</h3>
                    <Badge variant={seq.is_active ? 'success' : 'secondary'} className="text-xs">
                      {seq.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  {seq.description && <p className="text-xs text-navy-400 mb-2">{seq.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-navy-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {TRIGGER_OPTIONS.find((t) => t.value === seq.trigger_type)?.label || seq.trigger_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {seq.step_count} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {(seq.drip_enrollments as unknown as { count: number }[])?.[0]?.count || 0} enrolled
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(seq)}
                    className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors"
                    title={seq.is_active ? 'Pause' : 'Activate'}
                  >
                    {seq.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(seq.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Sequence' : 'Create Sequence'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            {/* Name & trigger */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Sequence Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Nurture" required className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What this sequence does..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Trigger</Label>
                <select
                  value={form.trigger_type}
                  onChange={(e) => setForm((f) => ({ ...f, trigger_type: e.target.value }))}
                  className="mt-1 w-full bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {TRIGGER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets */}
            <div>
              <Label className="text-xs text-navy-500">Load a template</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.keys(STEP_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => loadPreset(preset)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-navy-300 hover:text-white hover:border-brand-500/40 transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Steps ({form.steps.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="w-3 h-3" /> Add Step
                </Button>
              </div>
              <div className="space-y-2">
                {form.steps.map((step, i) => {
                  const meta = STEP_TYPE_META[step.step_type] || STEP_TYPE_META.email;
                  const Icon = meta.icon;
                  const isExpanded = expandedSteps.includes(i);
                  return (
                    <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/3 transition-colors"
                        onClick={() => toggleExpand(i)}
                      >
                        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{meta.label}</div>
                          <div className="text-xs text-navy-500">
                            {formatDelay(step.delay_hours)}
                            {step.subject && ` · ${step.subject.slice(0, 40)}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {i > 0 && <ArrowRight className="w-3 h-3 text-navy-600 rotate-90" />}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeStep(i); }} className="p-1 text-navy-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-navy-500" /> : <ChevronDown className="w-4 h-4 text-navy-500" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-white/5 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Step Type</Label>
                              <select
                                value={step.step_type}
                                onChange={(e) => updateStep(i, { step_type: e.target.value as SequenceStep['step_type'] })}
                                className="mt-1 w-full bg-navy-800 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                              >
                                {Object.entries(STEP_TYPE_META).map(([v, m]) => (
                                  <option key={v} value={v}>{m.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Delay (hours)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={step.delay_hours}
                                onChange={(e) => updateStep(i, { delay_hours: parseInt(e.target.value) || 0 })}
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                          </div>
                          {(step.step_type === 'email' || step.step_type === 'linkedin_message') && (
                            <>
                              {step.step_type === 'email' && (
                                <div>
                                  <Label className="text-xs">Subject</Label>
                                  <Input value={step.subject || ''} onChange={(e) => updateStep(i, { subject: e.target.value })} placeholder="Email subject..." className="mt-1 h-8 text-xs" />
                                </div>
                              )}
                              <div>
                                <Label className="text-xs">Body</Label>
                                <Textarea value={step.body || ''} onChange={(e) => updateStep(i, { body: e.target.value })} placeholder="Message content..." rows={4} className="mt-1 text-xs" />
                              </div>
                            </>
                          )}
                          {step.step_type === 'condition' && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Field</Label>
                                <select value={step.condition_field || ''} onChange={(e) => updateStep(i, { condition_field: e.target.value })} className="mt-1 w-full bg-navy-800 border border-white/10 rounded px-2 py-1.5 text-xs text-white">
                                  <option value="email_opened">Email Opened</option>
                                  <option value="email_clicked">Email Clicked</option>
                                  <option value="lead_score">Lead Score</option>
                                  <option value="lead_status">Lead Status</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Operator</Label>
                                <select value={step.condition_op || ''} onChange={(e) => updateStep(i, { condition_op: e.target.value })} className="mt-1 w-full bg-navy-800 border border-white/10 rounded px-2 py-1.5 text-xs text-white">
                                  <option value="equals">equals</option>
                                  <option value="greater_than">greater than</option>
                                  <option value="less_than">less than</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Value</Label>
                                <Input value={step.condition_value || ''} onChange={(e) => updateStep(i, { condition_value: e.target.value })} placeholder="true / 70 / qualified" className="mt-1 h-8 text-xs" />
                              </div>
                            </div>
                          )}
                          {step.step_type === 'linkedin_connect' && (
                            <div>
                              <Label className="text-xs">Connection Message</Label>
                              <Textarea value={step.body || ''} onChange={(e) => updateStep(i, { body: e.target.value })} placeholder="Hi {{first_name}}, ..." rows={3} className="mt-1 text-xs" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update Sequence' : 'Create Sequence'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
