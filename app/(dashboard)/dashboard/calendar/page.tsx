'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Linkedin, Twitter, Globe, Youtube, Instagram,
  Clock, CheckCircle, XCircle, Loader2, Trash2, Edit2, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

type Platform = 'linkedin' | 'twitter' | 'reddit' | 'youtube' | 'instagram';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  platform_variants: Partial<Record<Platform, string>>;
  image_url?: string;
  scheduled_at: string;
  status: string;
  approval_status: string;
  error_message?: string;
}

const PLATFORM_META: Record<Platform, { label: string; icon: React.ElementType; color: string }> = {
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
  twitter: { label: 'Twitter/X', icon: Twitter, color: 'text-sky-400' },
  reddit: { label: 'Reddit', icon: Globe, color: 'text-orange-400' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-400' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
};

const CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  reddit: 40000,
  youtube: 5000,
  instagram: 2200,
};

const OPTIMAL_TIMES: Record<Platform, string> = {
  linkedin: 'Tue–Thu 8–10am',
  twitter: 'Mon–Thu 12–3pm',
  reddit: 'Mon–Fri 6–9am',
  instagram: 'Mon–Fri 11am–1pm',
  youtube: 'Thu–Sat 12–4pm',
};

const ALL_PLATFORMS: Platform[] = ['linkedin', 'twitter', 'reddit', 'youtube', 'instagram'];

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  publishing: 'bg-yellow-500/20 text-yellow-400',
  published: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-navy-700 text-navy-400',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>('linkedin');
  const [form, setForm] = useState({
    title: '',
    content: '',
    platforms: [] as Platform[],
    platform_variants: {} as Partial<Record<Platform, string>>,
    image_url: '',
    scheduled_at: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date(year, month, 1).toISOString();
      const to = new Date(year, month + 1, 0, 23, 59).toISOString();
      const [postsRes, statusRes] = await Promise.all([
        fetch(`/api/posts/schedule?from=${from}&to=${to}`),
        fetch('/api/platforms/status'),
      ]);
      if (postsRes.ok) {
        const d = await postsRes.json();
        setPosts(d.posts || []);
      }
      if (statusRes.ok) {
        const d = await statusRes.json();
        setConnectedPlatforms((d.platforms || []).map((p: { platform: Platform }) => p.platform));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const getPostsForDay = (day: number) => {
    const d = new Date(year, month, day);
    return posts.filter((p) => {
      const pd = new Date(p.scheduled_at);
      return pd.getFullYear() === d.getFullYear() &&
        pd.getMonth() === d.getMonth() &&
        pd.getDate() === d.getDate();
    });
  };

  const openCompose = (day?: number) => {
    const defaultDate = day
      ? new Date(year, month, day, 9, 0)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateStr = defaultDate.toISOString().slice(0, 16);
    setSelectedPost(null);
    setForm({
      title: '',
      content: '',
      platforms: connectedPlatforms.slice(0, 1),
      platform_variants: {},
      image_url: '',
      scheduled_at: dateStr,
    });
    setActivePlatformTab(connectedPlatforms[0] || 'linkedin');
    setComposeOpen(true);
  };

  const openEdit = (post: ScheduledPost) => {
    setSelectedPost(post);
    setForm({
      title: post.title || '',
      content: post.content,
      platforms: post.platforms,
      platform_variants: post.platform_variants || {},
      image_url: post.image_url || '',
      scheduled_at: new Date(post.scheduled_at).toISOString().slice(0, 16),
    });
    setActivePlatformTab(post.platforms[0] || 'linkedin');
    setComposeOpen(true);
  };

  const getVariantContent = (platform: Platform) =>
    form.platform_variants[platform] ?? form.content;

  const setVariantContent = (platform: Platform, value: string) => {
    setForm((f) => ({
      ...f,
      platform_variants: { ...f.platform_variants, [platform]: value },
    }));
  };

  const applyToAll = () => {
    const base = getVariantContent(activePlatformTab);
    const variants: Record<Platform, string> = {} as Record<Platform, string>;
    form.platforms.forEach((p) => { variants[p] = base; });
    setForm((f) => ({ ...f, platform_variants: variants }));
    toast({ title: 'Applied to all platforms' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content && !Object.values(form.platform_variants).some(Boolean)) {
      toast({ title: 'Add content first', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const method = selectedPost ? 'PUT' : 'POST';
      const body = selectedPost
        ? { id: selectedPost.id, ...form, scheduled_at: new Date(form.scheduled_at).toISOString() }
        : { ...form, scheduled_at: new Date(form.scheduled_at).toISOString() };
      const res = await fetch('/api/posts/schedule', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: selectedPost ? 'Post updated!' : 'Post scheduled!' });
      setComposeOpen(false);
      fetchPosts();
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/posts/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Post removed' });
  };

  const togglePlatform = (p: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  const today = new Date();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-navy-400 text-sm mt-1">Schedule posts across all platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white px-3">{monthName}</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="gradient" size="sm" onClick={() => openCompose()}>
            <Plus className="w-4 h-4" /> Schedule Post
          </Button>
        </div>
      </div>

      {/* Optimal time guide */}
      <div className="flex flex-wrap gap-3 mb-6">
        {ALL_PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p];
          const Icon = meta.icon;
          return (
            <div key={p} className="flex items-center gap-1.5 text-xs text-navy-400 bg-white/3 rounded-lg px-3 py-1.5">
              <Icon className={`w-3 h-3 ${meta.color}`} />
              <span className="font-medium text-white">{meta.label}:</span>
              <Clock className="w-3 h-3" />
              {OPTIMAL_TIMES[p]}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : (
        <div className="bg-glass rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-navy-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-white/5 bg-white/1" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <div
                  key={day}
                  className={`min-h-[120px] border-b border-r border-white/5 p-1.5 transition-colors ${
                    isPast ? 'bg-white/1' : 'hover:bg-white/3 cursor-pointer'
                  }`}
                  onClick={() => !isPast && openCompose(day)}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mb-1.5 ${
                    isToday ? 'bg-brand-500 text-white' : 'text-navy-400'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); openEdit(post); }}
                        className={`rounded px-2 py-1 text-xs cursor-pointer hover:brightness-110 transition-all ${STATUS_COLOR[post.status] || 'bg-navy-700 text-navy-300'}`}
                      >
                        <div className="font-medium truncate">{post.title || post.content.slice(0, 30)}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {(post.platforms as Platform[]).slice(0, 3).map((p) => {
                            const Icon = PLATFORM_META[p]?.icon || Globe;
                            return <Icon key={p} className={`w-2.5 h-2.5 ${PLATFORM_META[p]?.color || 'text-navy-400'}`} />;
                          })}
                          <span className="text-navy-400 ml-auto">
                            {new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dayPosts.length === 0 && !isPast && (
                      <div className="text-navy-700 text-xs text-center py-2 opacity-0 hover:opacity-100">
                        <Plus className="w-3 h-3 inline" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming posts list */}
      {posts.filter((p) => p.status === 'scheduled').length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-white mb-3">Upcoming This Month</h2>
          <div className="space-y-2">
            {posts
              .filter((p) => p.status === 'scheduled')
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((post) => (
                <div key={post.id} className="bg-glass rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{post.title || post.content.slice(0, 50)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-navy-500" />
                      <span className="text-xs text-navy-500">
                        {new Date(post.scheduled_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-1">
                        {(post.platforms as Platform[]).map((p) => {
                          const Icon = PLATFORM_META[p]?.icon || Globe;
                          return <Icon key={p} className={`w-3.5 h-3.5 ${PLATFORM_META[p]?.color || ''}`} />;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[post.status]}`}>
                      {post.status}
                    </span>
                    <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Compose / Schedule Modal */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edit Scheduled Post' : 'Schedule a Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Title (optional)</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Post title for your reference..." className="mt-1" />
            </div>

            {/* Platform selector */}
            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {connectedPlatforms.map((p) => {
                  const meta = PLATFORM_META[p];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        form.platforms.includes(p)
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'bg-white/5 border-white/10 text-navy-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      {meta.label}
                      {form.platforms.includes(p) && <CheckCircle className="w-3 h-3" />}
                    </button>
                  );
                })}
                {connectedPlatforms.length === 0 && (
                  <p className="text-xs text-navy-500">Connect platforms in Syndication to schedule posts.</p>
                )}
              </div>
            </div>

            {/* Per-platform tabs */}
            {form.platforms.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Content (per platform)</Label>
                  <button type="button" onClick={applyToAll} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Apply to all platforms
                  </button>
                </div>
                <div className="flex gap-1 mb-2">
                  {form.platforms.map((p) => {
                    const meta = PLATFORM_META[p];
                    const Icon = meta.icon;
                    const content = getVariantContent(p);
                    const limit = CHAR_LIMITS[p];
                    const over = content.length > limit;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setActivePlatformTab(p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs border-b-2 transition-all ${
                          activePlatformTab === p
                            ? 'border-brand-500 text-white'
                            : `border-transparent text-navy-500 hover:text-navy-300`
                        } ${over ? 'text-red-400' : ''}`}
                      >
                        <Icon className={`w-3 h-3 ${meta.color}`} />
                        {meta.label}
                        {over && <XCircle className="w-3 h-3 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
                {form.platforms.map((p) => {
                  const content = getVariantContent(p);
                  const limit = CHAR_LIMITS[p];
                  const over = content.length > limit;
                  return (
                    <div key={p} className={activePlatformTab === p ? 'block' : 'hidden'}>
                      <Textarea
                        value={content}
                        onChange={(e) => setVariantContent(p, e.target.value)}
                        placeholder={`Write for ${PLATFORM_META[p].label}... (${limit} char limit)`}
                        rows={6}
                        className="resize-none"
                      />
                      <div className={`text-xs mt-1 text-right ${over ? 'text-red-400' : 'text-navy-500'}`}>
                        {content.length} / {limit}
                      </div>
                      <p className="text-xs text-navy-600 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Best time: {OPTIMAL_TIMES[p]}
                      </p>
                    </div>
                  );
                })}
                {/* Fallback content if no variant set */}
                {form.platforms.every((p) => !form.platform_variants[p]) && (
                  <div className="mt-3">
                    <Label className="text-xs text-navy-400">Base content (used if no platform variant set)</Label>
                    <Textarea
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder="Write your content here..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}

            {form.platforms.length === 0 && (
              <div>
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your content..."
                  rows={5}
                  className="mt-1"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Schedule Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setComposeOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                {selectedPost ? 'Update Schedule' : 'Schedule Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
