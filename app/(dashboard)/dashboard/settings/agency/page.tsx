'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Globe, Users, BarChart3, Plus, Settings, ExternalLink, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  domain: string;
  plan: string;
  reports: number;
  status: 'active' | 'paused' | 'trial';
}

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'TechStartup Co', domain: 'app.techstartup.co', plan: 'Growth', reports: 12, status: 'active' },
  { id: '2', name: 'GrowthAgency', domain: 'dashboard.growthagency.io', plan: 'Agency', reports: 8, status: 'active' },
  { id: '3', name: 'E-comm Brand', domain: 'ecommbrand.aryanka.io', plan: 'Starter', reports: 3, status: 'trial' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  trial: 'warning',
  paused: 'secondary',
};

export default function AgencyPortalPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '', plan: 'Starter' });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setClients((prev) => [...prev, {
      id: String(Date.now()),
      name: form.name,
      domain: form.domain || `${form.name.toLowerCase().replace(/\s+/g, '')}.aryanka.io`,
      plan: form.plan,
      reports: 0,
      status: 'trial',
    }]);
    setAddOpen(false);
    setForm({ name: '', domain: '', plan: 'Starter' });
    setSaving(false);
    toast({ title: 'Client workspace created!', description: 'White-label setup complete.' });
  };

  const totalMRR = clients.filter((c) => c.status === 'active').length * 299;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Agency Portal</h1>
          <p className="text-navy-400 text-sm mt-1">Manage client workspaces with white-label branding</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Active', value: clients.filter((c) => c.status === 'active').length, icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'MRR', value: `$${totalMRR.toLocaleString()}`, icon: BarChart3, color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-glass rounded-xl border border-white/10 p-5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-navy-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Client Workspaces</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Client', 'Domain', 'Plan', 'Reports', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-white">{client.name}</td>
                  <td className="px-5 py-4 text-sm text-navy-400 font-mono">{client.domain}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{client.plan}</td>
                  <td className="px-5 py-4 text-sm text-navy-300">{client.reports}</td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[client.status]} className="capitalize">{client.status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <ExternalLink className="w-3 h-3" /> Dashboard
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <Settings className="w-3 h-3" /> Branding
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Client Workspace</DialogTitle></DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <Label>Client Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" required className="mt-1" />
            </div>
            <div>
              <Label>Custom Domain (optional)</Label>
              <Input value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} placeholder="app.acmecorp.com" className="mt-1" />
            </div>
            <div>
              <Label>Plan</Label>
              <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))} className="mt-1 flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {['Starter', 'Growth', 'Agency'].map((p) => <option key={p} value={p} className="bg-navy-800">{p}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
