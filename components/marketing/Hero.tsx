'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Play, Star, Users, TrendingUp, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const stats = [
  { icon: Users, value: '2,400+', label: 'Active Users' },
  { icon: TrendingUp, value: '340%', label: 'Avg Traffic Growth' },
  { icon: Star, value: '4.9/5', label: 'User Rating' },
];

export default function Hero() {
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
        body: JSON.stringify({ email, source: 'hero', type: 'signup' }),
      });
      if (res.ok) {
        toast({ title: 'You\'re on the list!', description: 'We\'ll be in touch shortly.', variant: 'default' });
        setEmail('');
      }
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg pt-16">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-medium text-brand-300">
            The #1 Organic Growth Platform for B2B & B2C SaaS
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-up">
          Grow Your Business{' '}
          <span className="text-gradient">Without Spending</span>
          <br />
          a Rupee on Ads
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up">
          Aryanka automates your entire growth engine — multi-platform content
          syndication, SEO optimization, lead capture, email nurture, and a
          built-in CRM. All organic. Zero paid traffic.
        </p>

        {/* Email capture */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6 animate-fade-up"
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
            {loading ? 'Joining...' : 'Get Early Access'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-xs text-navy-500 mb-12 animate-fade-in">
          No credit card required. Free forever plan available.
        </p>

        {/* Demo CTA */}
        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-up">
          <Button variant="outline" size="lg" asChild>
            <a href="#book-demo">
              Book a Live Demo
            </a>
          </Button>
          <button className="flex items-center gap-2 text-sm text-navy-300 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors border border-white/10">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
            Watch 2-min demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-up">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="w-4 h-4 text-brand-400" />
                <span className="text-2xl font-bold text-white">{value}</span>
              </div>
              <span className="text-xs text-navy-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Product preview placeholder */}
        <div className="mt-20 relative max-w-5xl mx-auto animate-fade-up">
          <div className="bg-glass rounded-2xl p-1 shadow-2xl shadow-brand-500/10 border border-white/5">
            <div className="bg-navy-800 rounded-xl p-6 min-h-[320px] flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Leads This Month', value: '1,247', color: 'text-accent-400' },
                    { label: 'Organic Traffic', value: '28.4K', color: 'text-brand-400' },
                    { label: 'Conversion Rate', value: '8.3%', color: 'text-yellow-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-navy-900 rounded-xl p-4">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-navy-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-navy-500 text-sm">Dashboard Preview</p>
              </div>
            </div>
          </div>
          {/* Glow effect under product */}
          <div className="absolute -inset-4 bg-brand-500/5 blur-2xl rounded-3xl -z-10" />
        </div>
      </div>
    </section>
  );
}
