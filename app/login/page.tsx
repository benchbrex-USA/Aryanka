'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'auth_callback_failed') setError('Authentication failed. Please try again.');
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created! Check your email to confirm, then log in.');
      setTab('login');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 grid-bg flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to site */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-white mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Aryanka
        </Link>

        {/* Card */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Aryanka</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-navy-900 rounded-xl p-1 mb-8">
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-white text-navy-900'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-accent-400 flex-shrink-0" />
              <p className="text-sm text-accent-400">{success}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    onClick={async () => {
                      if (!email) { setError('Enter your email first.'); return; }
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      });
                      setError('');
                      setSuccess(error ? error.message : 'Reset link sent — check your email.');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="mt-0 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In to Dashboard'}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Mehta"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Work Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Free Account'}
              </Button>
              <p className="text-xs text-center text-navy-500">
                By signing up you agree to our{' '}
                <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-navy-500">
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                {tab === 'login' ? 'Sign up free' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
