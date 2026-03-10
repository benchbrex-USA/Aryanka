'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Linkedin, Twitter, Globe, Youtube, Instagram, Send } from 'lucide-react';

type Platform = 'linkedin' | 'twitter' | 'reddit' | 'youtube' | 'instagram';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  scheduled_at: string;
  approval_status: string;
  submitted_by: string;
  submitted_at: string;
  review_note: string | null;
}

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  reddit: Globe,
  youtube: Youtube,
  instagram: Instagram,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: 'text-blue-400',
  twitter: 'text-sky-400',
  reddit: 'text-orange-400',
  youtube: 'text-red-400',
  instagram: 'text-pink-400',
};

export default function ApprovalsPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts/schedule?approval_status=pending_review');
      if (res.ok) {
        const d = await res.json();
        setPosts((d.posts || []).filter((p: ScheduledPost) => p.approval_status === 'pending_review'));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await fetch('/api/posts/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approval_status: 'approved', reviewed_at: new Date().toISOString() }),
    });
    setActionLoading(null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: '✅ Post approved and scheduled!' });
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    await fetch('/api/posts/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approval_status: 'rejected', review_note: notes[id] || '', reviewed_at: new Date().toISOString() }),
    });
    setActionLoading(null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Post rejected', description: 'Author has been notified.' });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Approvals</h1>
          <p className="text-navy-400 text-sm mt-1">Review and approve posts before they go live</p>
        </div>
        <Badge variant={posts.length > 0 ? 'warning' : 'secondary'} className="text-sm px-3 py-1">
          {posts.length} pending
        </Badge>
      </div>

      {/* How it works */}
      <div className="bg-glass rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-navy-300">
          <strong className="text-white">Approval Workflow:</strong> Team members submit posts → Admins review here → Approved posts go to the content calendar → They publish at the scheduled time.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : posts.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-navy-400 text-sm">No posts pending review. You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-glass rounded-xl border border-white/10 p-5">
              {/* Post header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  {post.title && <h3 className="font-semibold text-white mb-1">{post.title}</h3>}
                  <div className="flex items-center gap-3 text-xs text-navy-500">
                    <span>Submitted {post.submitted_at ? new Date(post.submitted_at).toLocaleDateString() : 'recently'}</span>
                    <span>•</span>
                    <span>Scheduled for {new Date(post.scheduled_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Badge variant="warning" className="text-xs">Pending Review</Badge>
              </div>

              {/* Content preview */}
              <div className="bg-navy-800/60 rounded-xl p-4 mb-4 text-sm text-navy-200 whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-navy-500">Platforms:</span>
                {post.platforms.map((p) => {
                  const Icon = PLATFORM_ICONS[p] || Globe;
                  return (
                    <div key={p} className="flex items-center gap-1 text-xs text-navy-300">
                      <Icon className={`w-3.5 h-3.5 ${PLATFORM_COLORS[p] || ''}`} />
                      {p}
                    </div>
                  );
                })}
              </div>

              {/* Review note */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Optional: add a note for the author (shown on rejection)..."
                  value={notes[post.id] || ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [post.id]: e.target.value }))}
                  className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => handleApprove(post.id)}
                  disabled={actionLoading === post.id}
                >
                  {actionLoading === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve & Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(post.id)}
                  disabled={actionLoading === post.id}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Send className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
