'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  link: string;
  linkLabel: string;
  done: boolean;
}

interface ChecklistState {
  hasLead: boolean;
  hasPlatform: boolean;
  hasCampaign: boolean;
  hasBlogPost: boolean;
  hasDemo: boolean;
}

export default function OnboardingChecklist() {
  const [collapsed, setCollapsed] = useState(false);
  const [state, setState] = useState<ChecklistState>({
    hasLead:      false,
    hasPlatform:  false,
    hasCampaign:  false,
    hasBlogPost:  false,
    hasDemo:      false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads?limit=1').then((r) => r.json()),
      fetch('/api/platforms/status').then((r) => r.json()),
      fetch('/api/campaigns?limit=1').then((r) => r.json()),
      fetch('/api/blog?limit=1').then((r) => r.json()),
    ])
      .then(([leads, platforms, campaigns, blogs]) => {
        setState({
          hasLead:     (leads.total  || 0) > 0,
          hasPlatform: ((platforms.platforms || []).filter((p: {is_active: boolean}) => p.is_active).length) > 0,
          hasCampaign: (campaigns.total || campaigns.campaigns?.length || 0) > 0,
          hasBlogPost: (blogs.total  || blogs.posts?.length || 0) > 0,
          hasDemo:     false, // demo bookings don't have a list API yet
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items: ChecklistItem[] = [
    {
      id: 'lead',
      label: 'Capture your first lead',
      description: 'Add or import a lead to start your pipeline.',
      link: '/dashboard/leads',
      linkLabel: 'Go to Leads →',
      done: state.hasLead,
    },
    {
      id: 'platform',
      label: 'Connect a social platform',
      description: 'Link LinkedIn, Reddit, Twitter, or YouTube for content syndication.',
      link: '/dashboard/content',
      linkLabel: 'Connect platform →',
      done: state.hasPlatform,
    },
    {
      id: 'blog',
      label: 'Publish your first blog post',
      description: 'Write or AI-generate a post — Aryanka syndicates it automatically.',
      link: '/dashboard/blog',
      linkLabel: 'Create blog post →',
      done: state.hasBlogPost,
    },
    {
      id: 'campaign',
      label: 'Send your first email campaign',
      description: 'Email your leads directly from the campaigns dashboard.',
      link: '/dashboard/email',
      linkLabel: 'Create campaign →',
      done: state.hasCampaign,
    },
    {
      id: 'demo',
      label: 'Book a growth strategy call',
      description: 'Get a 1:1 walkthrough with our team.',
      link: '/book-demo',
      linkLabel: 'Book a demo →',
      done: state.hasDemo,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const allDone   = doneCount === items.length;

  // Hide if all done
  if (!loading && allDone) return null;

  const progressPct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(0,212,255,0.02)' }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.15))' }}>
            <Zap className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">
              Getting started — {doneCount}/{items.length} complete
            </div>
            <div className="text-xs text-navy-400 mt-0.5">
              {allDone ? 'All set! You\'re ready to grow.' : 'Complete these steps to unlock full growth potential'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #00D4FF, #3B82F6)' }}
            />
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-navy-500" /> : <ChevronUp className="w-4 h-4 text-navy-500" />}
        </div>
      </button>

      {!collapsed && (
        <div className="border-t border-white/5 divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-6 text-center text-sm text-navy-500">Loading…</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 ${item.done ? 'opacity-50' : ''}`}>
                {item.done
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-accent-400" />
                  : <Circle className="w-5 h-5 flex-shrink-0 text-navy-600" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.done ? 'line-through text-navy-400' : 'text-white'}`}>
                    {item.label}
                  </p>
                  {!item.done && (
                    <p className="text-xs text-navy-500 mt-0.5">{item.description}</p>
                  )}
                </div>
                {!item.done && (
                  <Link href={item.link} className="text-xs font-medium flex-shrink-0"
                    style={{ color: '#00D4FF' }}>
                    {item.linkLabel}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
