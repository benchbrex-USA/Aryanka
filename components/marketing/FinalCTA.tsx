'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const benefits = [
  'Free forever plan — no credit card',
  'Setup in under 5 minutes',
  'Cancel anytime',
];

export default function FinalCTA() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'final_cta', type: 'signup' }),
      });
      if (res.ok) {
        toast({ title: 'Welcome aboard!', description: 'Check your email for your access link.' });
        setEmail('');
      }
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="book-demo" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Start Growing Organically{' '}
          <span className="text-gradient">Today</span>
        </h2>
        <p className="text-lg text-navy-300 mb-8 max-w-xl mx-auto">
          Join 2,400+ businesses that have replaced their entire paid ad stack
          with Aryanka — and never looked back.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
        >
          <Input
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-14 text-base"
          />
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={loading}
            className="sm:w-auto w-full"
          >
            {loading ? 'Signing up...' : 'Get Started Free'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-navy-400">{b}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8">
          <p className="text-sm text-navy-500 mb-4">
            Or book a personalized 30-minute demo
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="mailto:demo@aryanka.io?subject=Book a Demo">
              Schedule a Demo Call
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
