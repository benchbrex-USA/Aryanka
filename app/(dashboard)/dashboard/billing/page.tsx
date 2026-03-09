'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Receipt, Plus, Trash2, Loader2, Edit2, CheckCircle, Clock, AlertCircle, XCircle, Download } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  line_items: LineItem[];
  billing_period_start?: string;
  billing_period_end?: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

interface Summary {
  total: number;
  paid: number;
  outstanding: number;
  count: number;
}

const STATUS_META = {
  draft:     { label: 'Draft',     icon: Edit2,       color: 'text-navy-400',   badge: 'secondary' as const },
  sent:      { label: 'Sent',      icon: Clock,       color: 'text-brand-400',  badge: 'default' as const },
  paid:      { label: 'Paid',      icon: CheckCircle, color: 'text-accent-400', badge: 'success' as const },
  overdue:   { label: 'Overdue',   icon: AlertCircle, color: 'text-red-400',    badge: 'destructive' as const },
  cancelled: { label: 'Cancelled', icon: XCircle,     color: 'text-navy-500',   badge: 'secondary' as const },
};

interface InvoiceForm {
  customer_name: string;
  customer_email: string;
  customer_address: string;
  currency: string;
  status: Invoice['status'];
  due_date: string;
  notes: string;
  line_items: LineItem[];
}

const defaultForm: InvoiceForm = {
  customer_name: '',
  customer_email: '',
  customer_address: '',
  currency: 'INR',
  status: 'draft',
  due_date: '',
  notes: '',
  line_items: [{ description: 'Aryanka Growth Plan — Monthly', quantity: 1, unit_price: 2999, amount: 2999 }],
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, paid: 0, outstanding: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(defaultForm);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/invoices');
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.invoices || []);
      setSummary(data.summary);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const calcTotal = () => form.line_items.reduce((a, i) => a + i.amount, 0);

  const addLineItem = () =>
    setForm((f) => ({ ...f, line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0, amount: 0 }] }));

  const updateLineItem = (idx: number, updates: Partial<LineItem>) =>
    setForm((f) => {
      const items = [...f.line_items];
      items[idx] = { ...items[idx], ...updates };
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        items[idx].amount = items[idx].quantity * items[idx].unit_price;
      }
      return { ...f, line_items: items };
    });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: calcTotal() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: 'Invoice created!', description: data.invoice.invoice_number });
      setOpen(false);
      setForm(defaultForm);
      fetchInvoices();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    const res = await fetch('/api/invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) { toast({ title: `Invoice marked as ${status}` }); fetchInvoices(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    await fetch('/api/invoices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchInvoices();
  };

  const formatCurrency = (amount: number, currency: string) =>
    `${currency === 'INR' ? '₹' : '$'}${Number(amount).toLocaleString('en-IN')}`;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoice Billing</h1>
          <p className="text-navy-400 text-sm mt-1">Create and track invoices for your clients</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invoiced', value: formatCurrency(summary.total, 'INR'), color: 'text-white' },
          { label: 'Paid', value: formatCurrency(summary.paid, 'INR'), color: 'text-accent-400' },
          { label: 'Outstanding', value: formatCurrency(summary.outstanding, 'INR'), color: 'text-yellow-400' },
          { label: 'Total Invoices', value: summary.count.toString(), color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-glass rounded-xl p-4 border border-white/10">
            <div className="text-xs text-navy-400 mb-1">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center border border-white/10">
          <Receipt className="w-10 h-10 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No invoices yet. Create your first invoice.</p>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Create Invoice</Button>
        </div>
      ) : (
        <div className="bg-glass rounded-xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Invoice #', 'Customer', 'Amount', 'Status', 'Due Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status];
                const Icon = meta.icon;
                return (
                  <tr key={inv.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-navy-300">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-white">{inv.customer_name}</div>
                      <div className="text-xs text-navy-500">{inv.customer_email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={meta.badge} className="text-xs">
                        <Icon className="w-3 h-3 mr-1" />
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-navy-400">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {inv.status === 'draft' && (
                          <button onClick={() => updateStatus(inv.id, 'sent')} className="text-xs text-brand-400 hover:underline">Send</button>
                        )}
                        {inv.status === 'sent' && (
                          <button onClick={() => updateStatus(inv.id, 'paid')} className="text-xs text-accent-400 hover:underline">Mark Paid</button>
                        )}
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Customer Name *</Label>
                <Input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} required className="mt-1" />
              </div>
              <div>
                <Label>Customer Email *</Label>
                <Input type="email" value={form.customer_email} onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))} required className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input value={form.customer_address} onChange={(e) => setForm((f) => ({ ...f, customer_address: e.target.value }))} placeholder="City, Country" className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <select className="mt-1 w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Invoice['status'] }))}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="w-3 h-3" />Add</Button>
              </div>
              <div className="space-y-2">
                {form.line_items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-white/3 rounded-xl border border-white/10">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                      placeholder="Description"
                      className="col-span-5 h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, { quantity: Number(e.target.value) })}
                      className="col-span-2 h-8 text-xs"
                      min="1"
                    />
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(idx, { unit_price: Number(e.target.value) })}
                      placeholder="Price"
                      className="col-span-2 h-8 text-xs"
                    />
                    <div className="col-span-2 text-xs font-medium text-white text-right">₹{item.amount.toLocaleString()}</div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) }))} className="col-span-1 text-navy-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end pr-12 text-sm font-bold text-white pt-2">
                  Total: ₹{calcTotal().toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, bank details..." className="mt-1" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Receipt className="w-4 h-4" />
                Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
