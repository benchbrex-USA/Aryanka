'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Search, Pencil, Eye, BookOpen, Loader2,
  Globe, Clock, Tag, ExternalLink,
} from 'lucide-react';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  tags: string[];
  views: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
};

type PostForm = { title: string; excerpt: string; content: string; tags: string; status: string; reading_time: string };

const EMPTY_FORM: PostForm = { title: '', excerpt: '', content: '', tags: '', status: 'draft', reading_time: '5' };

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary'> = {
  published: 'success',
  draft: 'warning',
  archived: 'secondary',
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      // Supabase not configured — show empty state
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openAdd = () => { setEditPost(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (post: Post) => {
    setEditPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      content: '',
      tags: post.tags.join(', '),
      status: post.status,
      reading_time: String(post.reading_time),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        slug: slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: form.status,
        reading_time: parseInt(form.reading_time) || 5,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      };
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: editPost ? 'Post updated' : 'Post created', description: `"${form.title}" ${form.status === 'published' ? 'is now live.' : 'saved as draft.'}` });
      setModalOpen(false);
      fetchPosts();
    } catch {
      toast({ title: 'Failed to save post', description: 'Check your Supabase connection.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = posts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog & SEO</h1>
          <p className="text-navy-400 mt-1 text-sm">{posts.length} posts — auto-generates sitemap and meta tags</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Blog
            </a>
          </Button>
          <Button variant="gradient" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* SEO stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Published Posts', value: posts.filter((p) => p.status === 'published').length, color: 'text-accent-400' },
          { label: 'Draft Posts', value: posts.filter((p) => p.status === 'draft').length, color: 'text-yellow-400' },
          { label: 'Total Views', value: posts.reduce((a, p) => a + (p.views || 0), 0).toLocaleString(), color: 'text-brand-400' },
          { label: 'Sitemap URLs', value: posts.filter((p) => p.status === 'published').length + 6, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-glass rounded-xl p-4">
            <div className="text-xs text-navy-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-glass rounded-xl flex flex-col items-center justify-center py-16">
          <BookOpen className="w-8 h-8 text-navy-600 mb-3" />
          <p className="text-sm text-navy-500 mb-4">
            {search ? 'No posts match your search.' : 'No blog posts yet. Create your first SEO-optimized post.'}
          </p>
          {!search && (
            <Button variant="gradient" size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4" /> Create First Post
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Title', 'Status', 'Tags', 'Read Time', 'Views', 'Date', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-navy-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-white text-sm line-clamp-1">{post.title}</div>
                      <div className="text-xs text-navy-500 mt-0.5">/{post.slug}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[post.status] || 'secondary'} className="capitalize">
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs bg-white/5 text-navy-400 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                        {post.tags.length > 2 && <span className="text-xs text-navy-600">+{post.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.reading_time}m
                    </td>
                    <td className="px-5 py-4 text-sm text-navy-300">{(post.views || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-navy-500 whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {post.status === 'published' && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="post-title">Title *</Label>
              <Input
                id="post-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="How to Generate 500 B2B Leads Without Ads"
                required
                className="mt-1"
              />
              {form.title && (
                <p className="text-xs text-navy-500 mt-1">Slug: /{slugify(form.title)}</p>
              )}
            </div>
            <div>
              <Label htmlFor="post-excerpt">Excerpt / Meta Description</Label>
              <Textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="A short description for SEO and card previews..."
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="post-content">Content (Markdown)</Label>
              <Textarea
                id="post-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="## Introduction&#10;&#10;Write your full blog post here..."
                rows={8}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post-tags">Tags (comma separated)</Label>
                <Input
                  id="post-tags"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="seo, b2b, lead-generation"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="post-read">Reading Time (min)</Label>
                <Input
                  id="post-read"
                  type="number"
                  min="1"
                  max="60"
                  value={form.reading_time}
                  onChange={(e) => setForm((f) => ({ ...f, reading_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="post-status">Status</Label>
              <select
                id="post-status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="draft" className="bg-navy-800">Draft</option>
                <option value="published" className="bg-navy-800">Published (Live + SEO indexed)</option>
                <option value="archived" className="bg-navy-800">Archived</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editPost ? 'Save Changes' : form.status === 'published' ? 'Publish Post' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
