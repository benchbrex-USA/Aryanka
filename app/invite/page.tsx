'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type InviteState = 'loading' | 'ready' | 'signing-up' | 'accepted' | 'error';

interface InviteInfo {
  workspace_name: string;
  invited_email: string;
  role: string;
  status: string;
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<InviteState>('loading');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (!token) { setState('error'); setError('Invalid invite link — token is missing.'); return; }
    fetchInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchInvite = async () => {
    const res = await fetch(`/api/invite?token=${token}`);
    if (!res.ok) {
      const data = await res.json();
      setState('error');
      setError(data.error || 'This invite link is invalid or has expired.');
      return;
    }
    const data = await res.json();
    setInvite(data.invite);
    setForm((f) => ({ ...f, email: data.invite.invited_email }));
    setState('ready');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('signing-up');

    const supabase = createClient();

    if (isLogin) {
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginErr) { setState('ready'); setError(loginErr.message); return; }
    } else {
      const { error: signupErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (signupErr) { setState('ready'); setError(signupErr.message); return; }
    }

    // Accept the invite
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json();
      setState('ready');
      setError(data.error || 'Failed to accept invite');
      return;
    }

    setState('accepted');
    setTimeout(() => router.push('/dashboard'), 2500);
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (state === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to the team!</h1>
          <p className="text-white/40">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
        <div className="text-center max-w-sm">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-white mb-3">Invalid invite</h1>
          <p className="text-white/40 mb-6">{error}</p>
          <Link href="/login" className="text-sm" style={{ color: '#00D4FF' }}>Sign in instead →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
              <span className="text-[#080808] font-black text-sm">A</span>
            </div>
            <span className="text-lg font-semibold text-white">Aryanka</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.06] p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Invite info */}
          {invite && (
            <div className="mb-6 p-4 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(0,212,255,0.04)' }}>
              <p className="text-sm text-white/50">You were invited to join</p>
              <p className="text-lg font-semibold text-white mt-0.5">{invite.workspace_name}</p>
              <p className="text-xs mt-1" style={{ color: '#00D4FF' }}>as {invite.role}</p>
            </div>
          )}

          <h1 className="text-xl font-bold text-white mb-1">
            {isLogin ? 'Sign in to accept' : 'Create your account'}
          </h1>
          <p className="text-white/40 text-sm mb-6">
            {isLogin ? 'Use your existing Aryanka account' : 'Join your team on Aryanka'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-400 border border-red-500/20 bg-red-500/5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required={!isLogin}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/[0.08] outline-none focus:border-[#00D4FF]/50 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/[0.08] outline-none focus:border-[#00D4FF]/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/[0.08] outline-none focus:border-[#00D4FF]/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>

            <button
              type="submit"
              disabled={state === 'signing-up'}
              className="w-full py-3 rounded-xl text-sm font-semibold text-[#080808] transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
            >
              {state === 'signing-up' && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign in & accept invite' : 'Create account & join'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {isLogin ? 'Need an account? Sign up instead' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
