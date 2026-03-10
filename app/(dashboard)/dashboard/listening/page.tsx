'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Radio, ExternalLink, ThumbsUp, Loader2, Search, Trash2, RefreshCw, Globe, Twitter } from 'lucide-react';

interface Mention {
  id: string;
  platform: string;
  keyword: string;
  title: string;
  body: string;
  url: string;
  author: string;
  sentiment: string;
  replied: boolean;
  found_at: string;
}

interface Keyword {
  id: string;
  keyword: string;
  platforms: string[];
  is_active: boolean;
}

const SENTIMENT_BADGE: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  positive: 'success',
  neutral: 'secondary',
  negative: 'destructive',
};

export default function ListeningPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ keyword: '', platforms: ['reddit', 'twitter'] as string[] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mentionsRes, kwRes] = await Promise.all([
        fetch('/api/listening/mentions'),
        fetch('/api/listening/keywords'),
      ]);
      if (mentionsRes.ok) setMentions((await mentionsRes.json()).mentions || []);
      if (kwRes.ok) setKeywords((await kwRes.json()).keywords || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/listening/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast({ title: 'Keyword added! Monitoring starts now.' });
      setOpen(false);
      setForm({ keyword: '', platforms: ['reddit', 'twitter'] });
      fetchData();
    } else {
      toast({ title: 'Failed to add keyword', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDeleteKeyword = async (id: string) => {
    await fetch('/api/listening/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const handleReply = async (mention: Mention) => {
    window.open(mention.url, '_blank');
    await fetch('/api/listening/mentions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mention.id, replied: true }),
    });
    setMentions((prev) => prev.map((m) => m.id === mention.id ? { ...m, replied: true } : m));
  };

  const positiveCount = mentions.filter((m) => m.sentiment === 'positive').length;
  const negativeCount = mentions.filter((m) => m.sentiment === 'negative').length;
  const unreplied = mentions.filter((m) => !m.replied).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Listening</h1>
          <p className="text-navy-400 text-sm mt-1">Track brand mentions across Reddit and Twitter/X</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Track Keyword
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Mentions', value: mentions.length, color: 'text-white' },
          { label: 'Positive', value: positiveCount, color: 'text-green-400' },
          { label: 'Negative', value: negativeCount, color: 'text-red-400' },
          { label: 'Needs Reply', value: unreplied, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-glass rounded-xl p-5">
            <div className="text-xs text-navy-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div className="bg-glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Tracked Keywords ({keywords.length})</h2>
        </div>
        {keywords.length === 0 ? (
          <div className="text-center py-6">
            <Radio className="w-8 h-8 text-navy-600 mx-auto mb-2" />
            <p className="text-navy-400 text-sm">No keywords tracked yet. Add your brand name to start listening.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <div key={kw.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Radio className="w-3 h-3 text-brand-400" />
                <span className="text-sm text-white">{kw.keyword}</span>
                <div className="flex gap-1">
                  {kw.platforms.includes('reddit') && <Globe className="w-3 h-3 text-orange-400" />}
                  {kw.platforms.includes('twitter') && <Twitter className="w-3 h-3 text-sky-400" />}
                </div>
                <button onClick={() => handleDeleteKeyword(kw.id)} className="text-navy-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentions feed */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : mentions.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Search className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm">No mentions found yet. Add keywords to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mentions.map((mention) => (
            <div key={mention.id} className={`bg-glass rounded-xl p-5 border ${mention.replied ? 'border-white/5 opacity-60' : 'border-white/10'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {mention.platform === 'reddit' ? <Globe className="w-4 h-4 text-orange-400" /> : <Twitter className="w-4 h-4 text-sky-400" />}
                    <span className="text-xs text-navy-400 capitalize">{mention.platform}</span>
                    <span className="text-xs text-navy-600">·</span>
                    <span className="text-xs text-navy-400">@{mention.author}</span>
                    <span className="text-xs text-navy-600">·</span>
                    <span className="text-xs text-navy-500">{new Date(mention.found_at).toLocaleDateString()}</span>
                    <Badge variant={SENTIMENT_BADGE[mention.sentiment] || 'secondary'} className="text-xs ml-auto">
                      {mention.sentiment}
                    </Badge>
                    {mention.replied && <Badge variant="secondary" className="text-xs">Replied</Badge>}
                  </div>
                  {mention.title && <h3 className="font-medium text-white text-sm mb-1">{mention.title}</h3>}
                  <p className="text-sm text-navy-300 line-clamp-2">{mention.body}</p>
                  <div className="mt-2">
                    <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full">"{mention.keyword}"</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(mention.url, '_blank')}>
                    <ExternalLink className="w-3 h-3" /> View
                  </Button>
                  {!mention.replied && (
                    <Button variant="gradient" size="sm" className="text-xs" onClick={() => handleReply(mention)}>
                      <ThumbsUp className="w-3 h-3" /> Reply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add keyword modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Track a Keyword</DialogTitle></DialogHeader>
          <form onSubmit={handleAddKeyword} className="space-y-4">
            <div>
              <Label>Keyword or Phrase *</Label>
              <Input
                value={form.keyword}
                onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                placeholder="Your brand name, competitor, topic..."
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Platforms</Label>
              <div className="flex gap-3 mt-2">
                {[
                  { value: 'reddit', label: 'Reddit', Icon: Globe, color: 'text-orange-400' },
                  { value: 'twitter', label: 'Twitter/X', Icon: Twitter, color: 'text-sky-400' },
                ].map(({ value, label, Icon, color }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(value)}
                      onChange={() => setForm((f) => ({
                        ...f,
                        platforms: f.platforms.includes(value)
                          ? f.platforms.filter((p) => p !== value)
                          : [...f.platforms, value],
                      }))}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-white">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Start Tracking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
