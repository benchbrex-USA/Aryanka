'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, FlaskConical, Trophy, Loader2, Trash2, TrendingUp, Eye, MousePointerClick } from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  page: string;
  element: string;
  variant_a: { text: string; color: string; [key: string]: string };
  variant_b: { text: string; color: string; [key: string]: string };
  impressions_a: number;
  impressions_b: number;
  conversions_a: number;
  conversions_b: number;
  winner?: 'a' | 'b';
  is_active: boolean;
  created_at: string;
}

function conversionRate(conversions: number, impressions: number) {
  if (impressions === 0) return '0%';
  return `${((conversions / impressions) * 100).toFixed(1)}%`;
}

function uplift(rateA: number, rateB: number) {
  if (rateA === 0) return null;
  const pct = ((rateB - rateA) / rateA) * 100;
  return pct.toFixed(1);
}

const defaultTest = {
  name: '',
  page: '/',
  element: 'hero_cta',
  variant_a: { text: 'Get Started Free', color: 'brand' },
  variant_b: { text: 'Book a Demo', color: 'accent' },
};

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultTest);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/ab-tests');
    if (res.ok) {
      const { tests: data } = await res.json();
      setTests(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: 'A/B test created!' });
      setOpen(false);
      setForm(defaultTest);
      fetchTests();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeclareWinner = async (id: string, winner: 'a' | 'b') => {
    const res = await fetch('/api/ab-tests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, winner, is_active: false }),
    });
    if (res.ok) { toast({ title: `Variant ${winner.toUpperCase()} declared winner!` }); fetchTests(); }
  };

  const handleToggle = async (test: ABTest) => {
    const res = await fetch('/api/ab-tests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: test.id, is_active: !test.is_active }),
    });
    if (res.ok) fetchTests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this A/B test?')) return;
    const res = await fetch('/api/ab-tests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast({ title: 'Test deleted' }); fetchTests(); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">A/B Testing</h1>
          <p className="text-navy-400 text-sm mt-1">Test different CTA variants to maximize conversions</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          New Test
        </Button>
      </div>

      {/* How it works */}
      <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4 mb-6 text-sm text-navy-300">
        <strong className="text-white">How it works:</strong> Create a test, integrate the tracking snippet on your page, and Aryanka automatically tracks impressions and conversions for each variant. Use the API endpoint <code className="text-brand-400 bg-black/20 px-1 rounded">/api/ab-tests</code> to record events.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : tests.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center border border-white/10">
          <FlaskConical className="w-10 h-10 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No A/B tests yet. Create your first test to start optimizing.</p>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Create Test</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const rateA = test.impressions_a > 0 ? test.conversions_a / test.impressions_a : 0;
            const rateB = test.impressions_b > 0 ? test.conversions_b / test.impressions_b : 0;
            const upliftVal = uplift(rateA, rateB);
            const leadingVariant = rateB > rateA ? 'B' : rateA > rateB ? 'A' : null;

            return (
              <div key={test.id} className="bg-glass rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{test.name}</span>
                      {test.winner && <Badge variant="success" className="text-xs"><Trophy className="w-3 h-3 mr-1" />Winner: {test.winner.toUpperCase()}</Badge>}
                      {!test.winner && <Badge variant={test.is_active ? 'default' : 'secondary'} className="text-xs">{test.is_active ? 'Running' : 'Paused'}</Badge>}
                    </div>
                    <div className="text-xs text-navy-500 mt-0.5">{test.page} · {test.element}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!test.winner && (
                      <button onClick={() => handleToggle(test)} className="text-xs text-navy-400 hover:text-white transition-colors">
                        {test.is_active ? 'Pause' : 'Resume'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(test.id)} className="p-1.5 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-white/5">
                  {(['a', 'b'] as const).map((variant) => {
                    const isVariantA = variant === 'a';
                    const variantData = isVariantA ? test.variant_a : test.variant_b;
                    const impressions = isVariantA ? test.impressions_a : test.impressions_b;
                    const conversions = isVariantA ? test.conversions_a : test.conversions_b;
                    const rate = impressions > 0 ? (conversions / impressions) * 100 : 0;
                    const isWinner = test.winner === variant || (leadingVariant === variant.toUpperCase() && !test.winner);

                    return (
                      <div key={variant} className={`p-5 ${isWinner && !test.winner ? 'bg-accent-500/3' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isVariantA ? 'bg-brand-500/20 text-brand-400' : 'bg-accent-500/20 text-accent-400'}`}>
                            Variant {variant.toUpperCase()}
                          </span>
                          {isWinner && leadingVariant && !test.winner && <TrendingUp className="w-4 h-4 text-accent-400" />}
                        </div>
                        <div className="bg-white/5 rounded-lg px-3 py-2 mb-3">
                          <span className="text-sm text-white">{variantData.text}</span>
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded text-white bg-${variantData.color}-500/30`}>{variantData.color}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="flex items-center justify-center gap-1 text-navy-500 mb-0.5"><Eye className="w-3 h-3" /></div>
                            <div className="text-sm font-bold text-white">{impressions.toLocaleString()}</div>
                            <div className="text-xs text-navy-500">Views</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-navy-500 mb-0.5"><MousePointerClick className="w-3 h-3" /></div>
                            <div className="text-sm font-bold text-white">{conversions.toLocaleString()}</div>
                            <div className="text-xs text-navy-500">Clicks</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-accent-400">{rate.toFixed(1)}%</div>
                            <div className="text-xs text-navy-500">CVR</div>
                          </div>
                        </div>
                        {!test.winner && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 text-xs"
                            onClick={() => handleDeclareWinner(test.id, variant)}
                          >
                            <Trophy className="w-3 h-3" />
                            Declare Winner
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {upliftVal !== null && Number(upliftVal) !== 0 && (
                  <div className="px-5 py-2.5 border-t border-white/5 text-xs text-center text-navy-400">
                    Variant B shows <span className={`font-medium ${Number(upliftVal) > 0 ? 'text-accent-400' : 'text-red-400'}`}>{Number(upliftVal) > 0 ? '+' : ''}{upliftVal}%</span> uplift over Variant A
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Test Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Hero CTA — Q1 Experiment" required className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Page</Label>
                <Input value={form.page} onChange={(e) => setForm((f) => ({ ...f, page: e.target.value }))} placeholder="/" className="mt-1" />
              </div>
              <div>
                <Label>Element</Label>
                <Input value={form.element} onChange={(e) => setForm((f) => ({ ...f, element: e.target.value }))} placeholder="hero_cta" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/3 rounded-xl border border-white/10">
              <div>
                <div className="text-xs font-bold text-brand-400 mb-2">Variant A (Control)</div>
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={form.variant_a.text}
                    onChange={(e) => setForm((f) => ({ ...f, variant_a: { ...f.variant_a, text: e.target.value } }))}
                    placeholder="Get Started Free"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div className="mt-2">
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={form.variant_a.color}
                    onChange={(e) => setForm((f) => ({ ...f, variant_a: { ...f.variant_a, color: e.target.value } }))}
                    placeholder="brand"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-accent-400 mb-2">Variant B (Test)</div>
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={form.variant_b.text}
                    onChange={(e) => setForm((f) => ({ ...f, variant_b: { ...f.variant_b, text: e.target.value } }))}
                    placeholder="Book a Demo"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div className="mt-2">
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={form.variant_b.color}
                    onChange={(e) => setForm((f) => ({ ...f, variant_b: { ...f.variant_b, color: e.target.value } }))}
                    placeholder="accent"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <FlaskConical className="w-4 h-4" />
                Create Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
