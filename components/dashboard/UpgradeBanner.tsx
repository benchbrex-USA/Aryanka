'use client';

import { useState } from 'react';
import { Zap, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UpgradeBannerProps {
  message: string;
  /** If false, show as an inline block; if true, show as a fixed top banner */
  inline?: boolean;
}

export default function UpgradeBanner({ message, inline = true }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading]     = useState(false);

  if (dismissed) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', interval: 'monthly' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Upgrade
          </button>
          <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-14 inset-x-0 z-40 flex items-center justify-between gap-4 px-6 py-2 border-b border-yellow-500/20"
      style={{ background: 'rgba(234,179,8,0.05)' }}>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <p className="text-xs text-yellow-300">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleUpgrade} disabled={loading}
          className="px-3 py-1 rounded-lg text-xs font-semibold text-[#080808]"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Upgrade to Pro'}
        </button>
        <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-400">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
