'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Gift, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('aryanka_popup_dismissed')) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setVisible(true);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Also show after 45 seconds on mobile
    const timer = setTimeout(() => {
      if (!dismissed && !sessionStorage.getItem('aryanka_popup_dismissed')) {
        setVisible(true);
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('aryanka_popup_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_popup', type: 'lead_magnet' }),
      });
      if (res.ok) {
        toast({ title: 'Lead Magnet sent!', description: 'Check your inbox for the free guide.' });
        dismiss();
      }
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative z-10 bg-navy-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-up">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center mb-6">
          <Gift className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          Wait — Free Lead Gen Playbook Inside
        </h3>
        <p className="text-navy-400 text-sm mb-6 leading-relaxed">
          Get our{' '}
          <span className="text-accent-400 font-semibold">
            "Zero-Budget B2B Lead Generation Playbook"
          </span>{' '}
          — 47 proven strategies to get 500+ qualified leads/month without
          spending a rupee on ads.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Your best email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Me the Free Playbook'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <button
          onClick={dismiss}
          className="mt-4 text-xs text-navy-500 hover:text-navy-400 transition-colors w-full text-center"
        >
          No thanks, I don't need more leads
        </button>
      </div>
    </div>
  );
}
