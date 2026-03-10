'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Linkedin, Globe, Twitter, Youtube, CheckCircle,
  Send, Loader2, Link2, Link2Off,
  Instagram, RefreshCw, Sparkles, Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Platform = 'linkedin' | 'twitter' | 'reddit' | 'youtube' | 'instagram';

interface ConnectedPlatform {
  platform: Platform;
  platform_username: string;
  platform_display_name: string;
  platform_avatar_url?: string;
  connected_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  created_at: string;
}

interface PlatformPost {
  id: string;
  platform: Platform;
  title: string;
  status: string;
  platform_post_url?: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  posted_at: string;
}

const PLATFORM_META: Record<Platform, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  twitter: { label: 'Twitter / X', icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
  reddit: { label: 'Reddit', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
};

const ALL_PLATFORMS: Platform[] = ['linkedin', 'twitter', 'reddit', 'youtube', 'instagram'];

const CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  reddit: 40000,
  instagram: 2200,
  youtube: 5000,
};

export default function ContentPage() {
  const router = useRouter();
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [platformPosts, setPlatformPosts] = useState<PlatformPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);
  const [syndicating, setSyndicating] = useState<Record<string, boolean>>({});
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [syndicateOpen, setSyndicateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Platform>('linkedin');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [platformContent, setPlatformContent] = useState<Partial<Record<Platform, string>>>({});
  const [form, setForm] = useState({
    title: '',
    content: '',
    url: '',
    image_url: '',
    subreddit: 'entrepreneur',
    platforms: [] as Platform[],
  });

  // Check URL params for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) {
      toast({ title: `${PLATFORM_META[connected as Platform]?.label || connected} connected!`, description: 'Your account is now linked.' });
      window.history.replaceState({}, '', '/dashboard/content');
    }
    if (error) {
      toast({ title: 'Connection failed', description: decodeURIComponent(error), variant: 'destructive' });
      window.history.replaceState({}, '', '/dashboard/content');
    }
    // Load draft from inspiration/templates
    const draft = sessionStorage.getItem('draft_content');
    if (draft) {
      try {
        const { content, platform } = JSON.parse(draft);
        setForm((f) => ({ ...f, content, platforms: platform && platform !== 'all' ? [platform as Platform] : [] }));
        setPlatformContent({ [platform as Platform]: content });
        if (platform && platform !== 'all') setActiveTab(platform as Platform);
        setNewPostOpen(true);
        sessionStorage.removeItem('draft_content');
      } catch { /* ignore */ }
    }
  }, []);

  const handleAiGenerateAll = async () => {
    if (!form.content && !form.title) {
      toast({ title: 'Add some content first', description: 'Write your base content then click AI Optimize.' });
      return;
    }
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'all_platforms',
          existing_content: form.content || form.title,
          topic: form.title,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.platforms) {
          setPlatformContent(d.platforms);
          toast({ title: 'AI optimized for all platforms!', description: 'Each tab now has platform-specific content.' });
        }
      }
    } catch {
      toast({ title: 'AI generation failed', variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, postsRes] = await Promise.all([
        fetch('/api/platforms/status'),
        fetch('/api/blog?limit=20&status=published'),
      ]);
      if (statusRes.ok) {
        const { platforms } = await statusRes.json();
        setConnectedPlatforms(platforms || []);
      }
      if (postsRes.ok) {
        const { posts: blogPosts } = await postsRes.json();
        setPosts(blogPosts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConnect = (platform: Platform) => {
    window.location.href = `/api/platforms/connect/${platform}`;
  };

  const handleDisconnect = async (platform: Platform) => {
    setDisconnecting(platform);
    try {
      const res = await fetch('/api/platforms/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        setConnectedPlatforms((prev) => prev.filter((p) => p.platform !== platform));
        toast({ title: `${PLATFORM_META[platform].label} disconnected` });
      } else {
        toast({ title: 'Failed to disconnect', variant: 'destructive' });
      }
    } finally {
      setDisconnecting(null);
    }
  };

  const isConnected = (platform: Platform) =>
    connectedPlatforms.some((p) => p.platform === platform);

  const getConnection = (platform: Platform) =>
    connectedPlatforms.find((p) => p.platform === platform);

  const openSyndicateModal = (post: BlogPost) => {
    setSelectedPost(post);
    setForm((f) => ({
      ...f,
      title: post.title,
      content: post.excerpt || '',
      url: `${window.location.origin}/blog/${post.slug ?? ''}`,
      platforms: connectedPlatforms.map((p) => p.platform),
    }));
    setSyndicateOpen(true);
  };

  const handleSyndicateSingle = async (platform: Platform, post?: BlogPost) => {
    const key = `${post?.id || 'new'}-${platform}`;
    setSyndicating((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch('/api/syndication/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          blog_post_id: post?.id,
          title: post?.title || form.title,
          body: post?.excerpt || form.content,
          url: post ? `${window.location.origin}/blog/${post.slug}` : form.url,
          image_url: form.image_url || undefined,
          subreddit: form.subreddit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: `Posted to ${PLATFORM_META[platform].label}!`,
          description: data.platform_post_url ? 'View it live →' : 'Content is now live.',
        });
      } else {
        toast({ title: `Failed: ${PLATFORM_META[platform].label}`, description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSyndicating((s) => ({ ...s, [key]: false }));
    }
  };

  const handleSyndicateAll = async () => {
    if (!selectedPost && !form.title) return;
    setSaving(true);
    for (const platform of form.platforms) {
      if (!isConnected(platform)) continue;
      await handleSyndicateSingle(platform, selectedPost || undefined);
    }
    setSaving(false);
    setSyndicateOpen(false);
  };

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug,
          content: form.content,
          excerpt: form.content.substring(0, 200),
          status: 'published',
          reading_time: Math.ceil(form.content.split(' ').length / 200),
        }),
      });
      if (!res.ok) throw new Error('Failed to save post');
      const { post } = await res.json();

      toast({ title: 'Post created!', description: 'Now syndicating to selected platforms...' });
      setNewPostOpen(false);

      // Syndicate to selected platforms
      for (const platform of form.platforms) {
        if (!isConnected(platform)) continue;
        await handleSyndicateSingle(platform, post);
      }

      setForm({ title: '', content: '', url: '', image_url: '', subreddit: 'entrepreneur', platforms: [] });
      fetchData();
    } catch {
      toast({ title: 'Failed to create post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFormPlatform = (platform: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(platform)
        ? f.platforms.filter((p) => p !== platform)
        : [...f.platforms, platform],
    }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Syndication</h1>
          <p className="text-navy-400 mt-1 text-sm">Connect your accounts and publish once, distribute everywhere</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setNewPostOpen(true)}>
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="bg-glass rounded-xl p-5">
        <h2 className="font-semibold text-white text-sm mb-4">Connected Platforms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ALL_PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            const connection = getConnection(platform);
            const connected = !!connection;
            const Icon = meta.icon;

            return (
              <div
                key={platform}
                className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                  connected ? meta.bg : 'bg-white/3 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${connected ? meta.color : 'text-navy-500'}`} />
                  {connected ? (
                    <Badge variant="success" className="text-xs">Connected</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not linked</Badge>
                  )}
                </div>
                <div>
                  <div className={`font-medium text-sm ${connected ? 'text-white' : 'text-navy-400'}`}>{meta.label}</div>
                  {connection && (
                    <div className="text-xs text-navy-400 truncate mt-0.5">{connection.platform_username}</div>
                  )}
                </div>
                {connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={disconnecting === platform}
                    onClick={() => handleDisconnect(platform)}
                  >
                    {disconnecting === platform ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Link2Off className="w-3 h-3" />
                    )}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleConnect(platform)}
                  >
                    <Link2 className="w-3 h-3" />
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white text-sm">Platform Performance</h2>
        </div>
        {connectedPlatforms.length === 0 ? (
          <div className="p-8 text-center text-navy-500 text-sm">
            Connect a platform above to see performance data
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Platform', 'Account', 'Posts', 'Impressions', 'Likes', 'Comments'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {connectedPlatforms.map((cp) => {
                  const meta = PLATFORM_META[cp.platform];
                  const Icon = meta.icon;
                  const pPosts = platformPosts.filter((pp) => pp.platform === cp.platform);
                  const totalImpressions = pPosts.reduce((a, p) => a + (p.impressions || 0), 0);
                  const totalLikes = pPosts.reduce((a, p) => a + (p.likes || 0), 0);
                  const totalComments = pPosts.reduce((a, p) => a + (p.comments || 0), 0);
                  return (
                    <tr key={cp.platform} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                          <span className="text-sm font-medium text-white">{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-navy-300">{cp.platform_username}</td>
                      <td className="px-5 py-3.5 text-sm text-navy-300">{pPosts.length}</td>
                      <td className="px-5 py-3.5 text-sm text-navy-300">{totalImpressions.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-sm text-accent-400">{totalLikes.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-sm text-navy-300">{totalComments.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Posts — Syndicate */}
      <div>
        <h2 className="font-semibold text-white text-sm mb-3">Published Posts</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-glass rounded-xl p-8 text-center text-navy-500 text-sm">
            No published posts yet.{' '}
            <button className="text-brand-400 hover:underline" onClick={() => setNewPostOpen(true)}>
              Create your first post →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-glass rounded-xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{post.title}</h3>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {connectedPlatforms.length === 0 ? (
                    <span className="text-xs text-navy-500">Connect a platform first</span>
                  ) : (
                    <>
                      {connectedPlatforms.map((cp) => {
                        const meta = PLATFORM_META[cp.platform];
                        const Icon = meta.icon;
                        const key = `${post.id}-${cp.platform}`;
                        return (
                          <button
                            key={cp.platform}
                            onClick={() => handleSyndicateSingle(cp.platform, post)}
                            disabled={syndicating[key]}
                            title={`Post to ${meta.label}`}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                          >
                            {syndicating[key] ? (
                              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                            ) : (
                              <Icon className={`w-4 h-4 ${meta.color}`} />
                            )}
                          </button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSyndicateModal(post)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Syndicate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create & Syndicate Content</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewPost} className="space-y-4">
            <div>
              <Label htmlFor="post-title">Post Title *</Label>
              <Input
                id="post-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="5 Ways to Generate 100 Leads This Week..."
                required
                className="mt-1"
              />
            </div>

            {/* Base content + AI optimize */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="post-content">Base Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={handleAiGenerateAll}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-brand-400" />}
                  AI Optimize All Platforms
                </Button>
              </div>
              <Textarea
                id="post-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your base content here. Use 'AI Optimize' to auto-adapt for each platform..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            {/* Per-platform tabs */}
            {Object.keys(platformContent).length > 0 && (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="flex border-b border-white/10">
                  {ALL_PLATFORMS.filter((p) => platformContent[p]).map((p) => {
                    const meta = PLATFORM_META[p];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setActiveTab(p)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                          activeTab === p ? 'border-brand-500 text-brand-400 bg-brand-500/5' : 'border-transparent text-navy-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                {ALL_PLATFORMS.filter((p) => platformContent[p]).map((p) => {
                  const content = platformContent[p] || '';
                  const limit = CHAR_LIMITS[p];
                  const over = content.length > limit;
                  return activeTab === p ? (
                    <div key={p} className="p-3">
                      <Textarea
                        value={content}
                        onChange={(e) => setPlatformContent((prev) => ({ ...prev, [p]: e.target.value }))}
                        rows={6}
                        className="text-sm resize-none"
                      />
                      <div className={`text-right text-xs mt-1 ${over ? 'text-red-400' : 'text-navy-500'}`}>
                        {content.length} / {limit}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <div>
              <Label htmlFor="post-url">Link URL (optional)</Label>
              <Input
                id="post-url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://aryanka.io/blog/..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="post-image">Image URL (required for Instagram)</Label>
              <Input
                id="post-image"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            {form.platforms.includes('reddit') && (
              <div>
                <Label htmlFor="subreddit">Subreddit</Label>
                <Input
                  id="subreddit"
                  value={form.subreddit}
                  onChange={(e) => setForm((f) => ({ ...f, subreddit: e.target.value }))}
                  placeholder="entrepreneur"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label>Syndicate to (connected platforms only)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_PLATFORMS.map((platform) => {
                  const meta = PLATFORM_META[platform];
                  const Icon = meta.icon;
                  const connected = isConnected(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      disabled={!connected}
                      onClick={() => connected && toggleFormPlatform(platform)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        !connected
                          ? 'opacity-40 cursor-not-allowed bg-white/3 border-white/10 text-navy-500'
                          : form.platforms.includes(platform)
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'bg-white/5 border-white/10 text-navy-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      {meta.label}
                      {form.platforms.includes(platform) && connected && <CheckCircle className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              {connectedPlatforms.length === 0 && (
                <p className="text-xs text-navy-500 mt-2">Connect platforms above to enable syndication.</p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/calendar')} disabled={saving}>
                <Calendar className="w-4 h-4" /> Schedule
              </Button>
              <Button type="button" variant="outline" onClick={() => setNewPostOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Publish & Syndicate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Syndicate Existing Post Modal */}
      <Dialog open={syndicateOpen} onOpenChange={setSyndicateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Syndicate Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <p className="text-sm text-navy-300 font-medium">{selectedPost.title}</p>
              <div>
                <Label>Select platforms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedPlatforms.map((cp) => {
                    const meta = PLATFORM_META[cp.platform];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={cp.platform}
                        type="button"
                        onClick={() => toggleFormPlatform(cp.platform)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                          form.platforms.includes(cp.platform)
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                            : 'bg-white/5 border-white/10 text-navy-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {form.platforms.includes('reddit') && (
                <div>
                  <Label htmlFor="syn-subreddit">Subreddit</Label>
                  <Input
                    id="syn-subreddit"
                    value={form.subreddit}
                    onChange={(e) => setForm((f) => ({ ...f, subreddit: e.target.value }))}
                    placeholder="entrepreneur"
                    className="mt-1"
                  />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSyndicateOpen(false)} disabled={saving}>Cancel</Button>
                <Button variant="gradient" onClick={handleSyndicateAll} disabled={saving || form.platforms.length === 0}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Post to {form.platforms.length} platform{form.platforms.length !== 1 ? 's' : ''}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
