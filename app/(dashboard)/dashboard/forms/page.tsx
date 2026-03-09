'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, FormInput, Trash2, Loader2, Edit2, Code2, Copy, CheckCircle,
  GripVertical, ToggleLeft, ToggleRight,
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface CustomForm {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: { redirect_url?: string; success_message: string; send_notification: boolean };
  lead_count: number;
  is_active: boolean;
  created_at: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
];

const defaultField = (): FormField => ({
  id: Math.random().toString(36).slice(2, 9),
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
});

interface FormState {
  name: string;
  description: string;
  fields: FormField[];
  settings: { redirect_url?: string; success_message: string; send_notification: boolean };
}

const defaultForm: FormState = {
  name: '',
  description: '',
  fields: [{ id: 'email', type: 'email', label: 'Email', placeholder: 'you@company.com', required: true }],
  settings: { redirect_url: '', success_message: 'Thank you! We will be in touch.', send_notification: true },
};

export default function FormsPage() {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState<CustomForm | null>(null);
  const [editing, setEditing] = useState<CustomForm | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [copied, setCopied] = useState(false);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/forms');
    if (res.ok) { const { forms: data } = await res.json(); setForms(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (f: CustomForm) => {
    setEditing(f);
    setForm({ name: f.name, description: f.description || '', fields: f.fields, settings: f.settings });
    setOpen(true);
  };

  const addField = () => setForm((f) => ({ ...f, fields: [...f.fields, defaultField()] }));
  const removeField = (id: string) => setForm((f) => ({ ...f, fields: f.fields.filter((field) => field.id !== id) }));
  const updateField = (id: string, updates: Partial<FormField>) =>
    setForm((f) => ({ ...f, fields: f.fields.map((field) => field.id === id ? { ...field, ...updates } : field) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/forms', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      toast({ title: editing ? 'Form updated!' : 'Form created!' });
      setOpen(false);
      fetchForms();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (f: CustomForm) => {
    await fetch('/api/forms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: f.id, is_active: !f.is_active }),
    });
    fetchForms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this form?')) return;
    await fetch('/api/forms', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchForms();
  };

  const getEmbedCode = (f: CustomForm) =>
    `<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'https://aryanka.io'}/embed/form/${f.id}" width="100%" height="500" frameborder="0"></iframe>`;

  const copyEmbed = async (f: CustomForm) => {
    await navigator.clipboard.writeText(getEmbedCode(f));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Capture Forms</h1>
          <p className="text-navy-400 text-sm mt-1">Build unlimited forms and embed them anywhere</p>
        </div>
        <Button variant="gradient" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New Form
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : forms.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center border border-white/10">
          <FormInput className="w-10 h-10 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No forms yet. Build your first lead capture form.</p>
          <Button variant="gradient" size="sm" onClick={openCreate}><Plus className="w-4 h-4" />Build Form</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {forms.map((f) => (
            <div key={f.id} className="bg-glass rounded-xl border border-white/10 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm truncate">{f.name}</span>
                    <Badge variant={f.is_active ? 'success' : 'secondary'} className="text-xs flex-shrink-0">
                      {f.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  {f.description && <p className="text-xs text-navy-400 truncate">{f.description}</p>}
                </div>
                <button onClick={() => handleToggle(f)} className="flex-shrink-0 text-navy-500 hover:text-white transition-colors">
                  {f.is_active ? <ToggleRight className="w-5 h-5 text-accent-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-navy-400 mb-4">
                <span>{f.fields.length} field{f.fields.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span className="text-accent-400 font-medium">{f.lead_count} leads</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(f)}>
                  <Edit2 className="w-3 h-3" />Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setEmbedOpen(f)}>
                  <Code2 className="w-3 h-3" />Embed
                </Button>
                <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Form' : 'Create Form'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Form Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Contact Us" required className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description..." className="mt-1" />
              </div>
            </div>

            {/* Fields builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Form Fields</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="w-3 h-3" />Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {form.fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 p-3 bg-white/3 rounded-xl border border-white/10">
                    <GripVertical className="w-4 h-4 text-navy-600 flex-shrink-0" />
                    <select
                      className="bg-navy-800 border border-white/10 rounded px-2 py-1 text-xs text-white w-28"
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                    >
                      {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1 h-8 text-xs"
                    />
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder"
                      className="flex-1 h-8 text-xs"
                    />
                    <label className="flex items-center gap-1 text-xs text-navy-400 flex-shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-3 h-3"
                      />
                      Req
                    </label>
                    <button type="button" onClick={() => removeField(field.id)} className="text-navy-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="p-4 bg-white/3 rounded-xl border border-white/10 space-y-3">
              <div className="text-xs font-semibold text-white mb-2">Form Settings</div>
              <div>
                <Label className="text-xs">Success Message</Label>
                <Input
                  value={form.settings.success_message}
                  onChange={(e) => setForm((f) => ({ ...f, settings: { ...f.settings, success_message: e.target.value } }))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Redirect URL (after submit)</Label>
                <Input
                  value={form.settings.redirect_url || ''}
                  onChange={(e) => setForm((f) => ({ ...f, settings: { ...f.settings, redirect_url: e.target.value } }))}
                  placeholder="https://..."
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Form'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Embed Code Modal */}
      <Dialog open={!!embedOpen} onOpenChange={() => setEmbedOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Form — {embedOpen?.name}</DialogTitle>
          </DialogHeader>
          {embedOpen && (
            <div className="space-y-4">
              <p className="text-sm text-navy-400">Copy and paste this snippet anywhere on your website:</p>
              <div className="relative">
                <pre className="bg-black/40 rounded-xl p-4 text-xs text-accent-400 overflow-x-auto border border-white/10 whitespace-pre-wrap break-all">
                  {getEmbedCode(embedOpen)}
                </pre>
                <button
                  onClick={() => copyEmbed(embedOpen)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-accent-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-navy-500">Leads captured via this form will automatically appear in your CRM with the form as the source.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
