'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Linkedin, Globe, Twitter, Youtube, CheckCircle,
  Clock, AlertCircle, Send, ExternalLink, RefreshCw, Loader2,
} from 'lucide-react';

type Platform = { name: string; icon: typeof Linkedin; color: string; key: string };
type SyndicationStatus = 'idle' | 'publishing' | 'published' | 'failed';

const PLATFORMS: Platform[] = [
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', key: 'linkedin' },
  { name: 'Reddit', icon: Globe, color: 'text-orange-400', key: 'reddit' },
  { name: 'Medium', icon: Globe, color: 'text-green-400', key: 'medium' },
  { name: 'Twitter/X', icon: Twitter, color: 'text-sky-400', key: 'twitter' },
  { name: 'YouTube', icon: Youtube, color: 'text-red-400', key: 'youtube' },
];

const SAMPLE_POSTS = [
  { id: '1', title: 'How to Generate 500 B2B Leads Per Month Without Spending on Ads', date: '2024-01-15', published: ['linkedin', 'reddit', 'medium'], reach: 12400, leads: 47 },
  { id: '2', title: 'The Ultimate Guide to Organic Traffic for SaaS in 2024', date: '2024-01-10', published: ['linkedin', 'reddit', 'medium', 'twitter'], reach: 8900, leads: 31 },
];

const platformStats = [
  { platform: 'Google Search', impressions: '142K', clicks: '8,431', ctr: '5.9%' },
  { platform: 'LinkedIn', impressions: '28K', clicks: '1,847', ctr: '6.6%' },
  { platform: 'Reddit', impressions: '19K', clicks: '1,203', ctr: '6.3%' },
  { platform: 'Medium', impressions: '11K', clicks: '782', ctr: '7.1%' },
  { platform: 'Twitter/X', impressions: '34K', clicks: '892', ctr: '2.6%' },
];

export default function ContentPage() {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [syndicating, setSyndicating] = useState<Record<string, SyndicationStatus>>({});
  const [form, setForm] = useState({ title: '', content: '', platforms: [] as string[] });
  const [saving, setSaving] = useState(false);

  const togglePlatform = (key: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(key)
        ? f.platforms.filter((p) => p !== key)
        : [...f.platforms, key],
    }));
  };

  const handleSyndicate = async (postId: string, platform: string) => {
    const key = `${postId}-${platform}`;
    setSyndicating((s) => ({ ...s, [key]: 'publishing' }));
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    setSyndicating((s) => ({ ...s, [key]: success ? 'published' : 'failed' }));
    toast({
      title: success ? `Published to ${platform}` : `Failed to publish to ${platform}`,
      description: success ? 'Your content is now live.' : 'Please try again.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleSyndicateAll = async (postId: string) => {
    for (const p of PLATFORMS) {
      const key = `${postId}-${p.key}`;
      if (syndicating[key] === 'published') continue;
      await handleSyndicate(postId, p.name);
    }
  };

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content, status: 'published', syndicate_to: form.platforms }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Post created!', description: `Syndicating to ${form.platforms.length} platform(s).` });
      setNewPostOpen(false);
      setForm({ title: '', content: '', platforms: [] });
    } catch {
      toast({ title: 'Failed to create post', description: 'Check your Supabase configuration.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getSyndicationIcon = (postId: string, platformKey: string, published: string[]) => {
    const key = `${postId}-${platformKey}`;
    const status = syndicating[key];
    if (status === 'publishing') return <Loader2 className="w-3 h-3 animate-spin text-brand-400" />;
    if (status === 'published' || published.includes(platformKey)) return <CheckCircle className="w-3 h-3 text-accent-400" />;
    if (status === 'failed') return <AlertCircle className="w-3 h-3 text-red-400" />;
    return <Clock className="w-3 h-3 text-navy-500" />;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Syndication</h1>
          <p className="text-navy-400 mt-1 text-sm">Publish once, distribute everywhere automatically</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setNewPostOpen(true)}>
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Platform stats */}
      <div className="bg-glass rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white text-sm">Platform Performance (30 days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Platform', 'Impressions', 'Clicks', 'CTR'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {platformStats.map((row) => (
                <tr key={row.platform} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{row.platform}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.impressions}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-300">{row.clicks}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-accent-400">{row.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Syndicated posts */}
      <h2 className="font-semibold text-white text-sm mb-3">Syndicated Content</h2>
      <div className="space-y-4">
        {SAMPLE_POSTS.map((post) => (
          <div key={post.id} className="bg-glass rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm">{post.title}</h3>
                <p className="text-xs text-navy-500 mt-1">{post.date}</p>
              </div>
              <div className="flex items-center gap-4 text-right flex-shrink-0">
                <div>
                  <div className="text-sm font-bold text-white">{post.reach.toLocaleString()}</div>
                  <div className="text-xs text-navy-500">Reach</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-accent-400">{post.leads}</div>
                  <div className="text-xs text-navy-500">Leads</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PLATFORMS.map((p) => {
                const key = `${post.id}-${p.key}`;
                const isPublished = post.published.includes(p.key) || syndicating[key] === 'published';
                const isPublishing = syndicating[key] === 'publishing';
                return (
                  <button
                    key={p.key}
                    onClick={() => !isPublished && !isPublishing && handleSyndicate(post.id, p.name)}
                    disabled={isPublished || isPublishing}
                    title={isPublished ? `Published to ${p.name}` : `Publish to ${p.name}`}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                      isPublished
                        ? 'bg-accent-500/10 text-accent-400 cursor-default'
                        : isPublishing
                        ? 'bg-brand-500/10 text-brand-400 cursor-wait'
                        : 'bg-navy-800/50 text-navy-400 hover:bg-navy-700 hover:text-white cursor-pointer'
                    }`}
                  >
                    <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                    <span>{p.name}</span>
                    {getSyndicationIcon(post.id, p.key, post.published)}
                  </button>
                );
              })}
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => handleSyndicateAll(post.id)}>
                <Send className="w-3.5 h-3.5" />
                Sync All
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
            <div>
              <Label htmlFor="post-content">Content *</Label>
              <Textarea
                id="post-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your content here. It will be adapted for each platform automatically..."
                rows={6}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Syndicate to Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePlatform(p.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.platforms.includes(p.key)
                        ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                        : 'bg-white/5 border-white/10 text-navy-400 hover:text-white'
                    }`}
                  >
                    <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                    {p.name}
                    {form.platforms.includes(p.key) && <CheckCircle className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
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
    </div>
  );
}
