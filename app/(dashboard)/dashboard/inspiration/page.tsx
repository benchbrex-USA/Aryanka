'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Copy, ChevronRight, Loader2, Linkedin, Twitter, Globe, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostTemplate {
  id: string;
  category: string;
  platform: 'linkedin' | 'twitter' | 'reddit' | 'all';
  title: string;
  content: string;
  engagement_level: 'high' | 'very_high' | 'viral';
  tags: string[];
}

const TEMPLATES: PostTemplate[] = [
  // Thought Leadership
  { id: '1', category: 'Thought Leadership', platform: 'linkedin', title: 'The contrarian take', content: "Everyone tells you to [conventional wisdom].\n\nI disagree.\n\nHere's what actually works:\n\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\nI've seen this work at [Company/Context].\n\nWhat do you think? Drop your opinion below 👇", engagement_level: 'very_high', tags: ['opinion', 'debate', 'linkedin'] },
  { id: '2', category: 'Thought Leadership', platform: 'linkedin', title: 'The "10 years ago" frame', content: "10 years ago, I [made a mistake / had a belief].\n\nToday I know: [lesson learned].\n\nThe shift happened when [turning point].\n\nIf I could go back, I'd tell myself:\n• [Advice 1]\n• [Advice 2]\n• [Advice 3]\n\nWhat's one thing you wish you knew earlier in your career?", engagement_level: 'high', tags: ['reflection', 'career', 'linkedin'] },
  { id: '3', category: 'Thought Leadership', platform: 'linkedin', title: 'The industry prediction', content: "[Industry] is about to change dramatically.\n\nHere's what most people are missing:\n\n[Insight 1] → [Implication]\n[Insight 2] → [Implication]\n[Insight 3] → [Implication]\n\nThe companies that adapt to this now will own the next decade.\n\nThe ones that don't? They'll be the next Blockbuster.\n\nAm I wrong? Convince me. ⬇️", engagement_level: 'viral', tags: ['prediction', 'future', 'linkedin'] },

  // Product / Launch
  { id: '4', category: 'Product Launch', platform: 'linkedin', title: 'The before/after reveal', content: "We built [feature] after hearing [problem] from 47 users.\n\nBefore:\n❌ [Pain point 1]\n❌ [Pain point 2]\n❌ [Pain point 3]\n\nAfter:\n✅ [Solution 1]\n✅ [Solution 2]\n✅ [Solution 3]\n\nThis is what happens when you actually listen to your users.\n\n[CTA - try it / link in comments]", engagement_level: 'high', tags: ['product', 'launch', 'linkedin'] },
  { id: '5', category: 'Product Launch', platform: 'twitter', title: 'Twitter launch thread', content: "We just shipped [Feature Name] 🚀\n\nThread on what we built, why we built it, and what we learned:\n\n1/", engagement_level: 'very_high', tags: ['product', 'launch', 'twitter', 'thread'] },

  // Case Study
  { id: '6', category: 'Case Study', platform: 'linkedin', title: 'The metric story', content: "[Customer] was struggling with [problem].\n\nThey tried [alternative]. It didn't work.\n\nThen they used [your solution].\n\nResults after [timeframe]:\n📈 [Metric 1]\n📈 [Metric 2]\n📈 [Metric 3]\n\nHere's exactly what they did:\n\n[Step 1]\n[Step 2]\n[Step 3]\n\nThe secret? [Key insight].", engagement_level: 'high', tags: ['case-study', 'results', 'linkedin'] },
  { id: '7', category: 'Case Study', platform: 'reddit', title: 'Reddit value post', content: "I helped [type of company] increase [metric] by [X]% in [timeframe]. Here's exactly how:\n\n**The Problem**\n[Problem description]\n\n**What We Tried First (That Didn't Work)**\n[Failed approach]\n\n**What Actually Worked**\n[Solution breakdown]\n\n**Results**\n- [Metric 1]\n- [Metric 2]\n\nHappy to answer questions.", engagement_level: 'very_high', tags: ['case-study', 'reddit', 'value'] },

  // Questions / Polls
  { id: '8', category: 'Engagement', platform: 'linkedin', title: 'The controversial poll', content: "Hot take: [Controversial statement in your industry].\n\nAgree or disagree?\n\n👍 Like if you agree\n🔥 Comment if you disagree (and tell me why)\n\nI'll share why I believe this in the comments after 24 hours.", engagement_level: 'viral', tags: ['engagement', 'poll', 'debate'] },
  { id: '9', category: 'Engagement', platform: 'twitter', title: 'Twitter question', content: "What's the most counterintuitive thing you've learned about [topic]?\n\nI'll start: [your answer]\n\nGo ⬇️", engagement_level: 'high', tags: ['engagement', 'question', 'twitter'] },

  // Story
  { id: '10', category: 'Story', platform: 'linkedin', title: 'The failure story', content: "I failed at [thing] 3 times before I figured out why.\n\nFail 1: [What happened]\nLesson: [What I learned]\n\nFail 2: [What happened]\nLesson: [What I learned]\n\nFail 3: [What happened]\nLesson: [What I learned]\n\nThe turning point: [Insight that changed everything]\n\nNow [outcome].\n\nFailure isn't the opposite of success. It's part of it.", engagement_level: 'very_high', tags: ['story', 'failure', 'growth'] },
  { id: '11', category: 'Story', platform: 'linkedin', title: 'The "I was wrong" post', content: "I was wrong about [topic].\n\nI used to believe [old belief].\n\nI argued this publicly. Multiple times.\n\nHere's what changed my mind:\n\n[Evidence/experience that shifted your view]\n\nI've updated my view. Now I believe [new belief].\n\nChanging your mind publicly is scary.\n\nBut intellectual honesty > being right.", engagement_level: 'viral', tags: ['story', 'growth', 'credibility'] },

  // Educational
  { id: '12', category: 'Educational', platform: 'linkedin', title: 'The framework post', content: "The [X]-part framework for [solving problem]:\n\nPart 1: [Concept]\n→ [Explanation]\n→ Example: [Real example]\n\nPart 2: [Concept]\n→ [Explanation]\n→ Example: [Real example]\n\nPart 3: [Concept]\n→ [Explanation]\n→ Example: [Real example]\n\nSave this. You'll need it.\n\n♻️ Repost if this helps someone on your network.", engagement_level: 'high', tags: ['educational', 'framework', 'value'] },
  { id: '13', category: 'Educational', platform: 'twitter', title: 'Twitter tips thread', content: "[X] things I wish I knew about [topic]:\n\nA thread 🧵\n\n1/ [Tip 1]\n\n2/ [Tip 2]\n\n...\n\nLast one is the most important:", engagement_level: 'very_high', tags: ['educational', 'thread', 'twitter'] },
];

const CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));
const PLATFORM_ICONS: Record<string, React.ElementType> = { linkedin: Linkedin, twitter: Twitter, reddit: Globe, all: Sparkles };
const PLATFORM_COLORS: Record<string, string> = { linkedin: 'text-blue-400', twitter: 'text-sky-400', reddit: 'text-orange-400', all: 'text-brand-400' };
const ENGAGEMENT_BADGE: Record<string, 'success' | 'warning' | 'default'> = { viral: 'success', very_high: 'warning', high: 'default' };

export default function InspirationPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchesCat = catFilter === 'all' || t.category === catFilter;
    const matchesPlatform = platformFilter === 'all' || t.platform === platformFilter || t.platform === 'all';
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some((tag) => tag.includes(search.toLowerCase()));
    return matchesCat && matchesPlatform && matchesSearch;
  });

  const copyTemplate = (template: PostTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast({ title: 'Template copied!', description: 'Now customize it in your content composer.' });
  };

  const useTemplate = (template: PostTemplate) => {
    sessionStorage.setItem('draft_content', JSON.stringify({ content: template.content, platform: template.platform }));
    toast({ title: 'Template loaded!', description: 'Opening content composer...' });
    router.push('/dashboard/content');
  };

  const aiPersonalize = async (template: PostTemplate) => {
    setAiLoading(template.id);
    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'improve',
          existing_content: template.content,
          platform: template.platform === 'all' ? 'linkedin' : template.platform,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        sessionStorage.setItem('draft_content', JSON.stringify({ content: d.content, platform: template.platform }));
        toast({ title: 'AI personalized!', description: 'Opening composer with your version...' });
        router.push('/dashboard/content');
      }
    } catch {
      toast({ title: 'AI failed', variant: 'destructive' });
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Post Inspiration Library</h1>
          <p className="text-navy-400 text-sm mt-1">{TEMPLATES.length} high-performing templates — one click to use</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-1">
          {['all', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                catFilter === c ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-navy-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'linkedin', 'twitter', 'reddit'].map((p) => {
            const Icon = PLATFORM_ICONS[p] || Sparkles;
            return (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  platformFilter === p ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-navy-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3 h-3 ${PLATFORM_COLORS[p] || ''}`} />
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const Icon = PLATFORM_ICONS[template.platform] || Sparkles;
          return (
            <div key={template.id} className="bg-glass rounded-xl border border-white/10 p-5 hover:border-brand-500/30 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${PLATFORM_COLORS[template.platform]}`} />
                    <span className="text-xs text-navy-400 capitalize">{template.platform}</span>
                    <Badge variant={ENGAGEMENT_BADGE[template.engagement_level]} className="text-xs capitalize">
                      {template.engagement_level.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-white text-sm">{template.title}</h3>
                  <span className="text-xs text-navy-500">{template.category}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-navy-800/50 rounded-xl p-3 mb-3 text-xs text-navy-300 line-clamp-4 whitespace-pre-wrap">
                {template.content}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-white/5 text-navy-500 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => copyTemplate(template)}>
                  <Copy className="w-3 h-3" />Copy
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => useTemplate(template)}>
                  Use <ChevronRight className="w-3 h-3" />
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  className="text-xs px-2"
                  onClick={() => aiPersonalize(template)}
                  disabled={aiLoading === template.id}
                  title="AI personalize this template"
                >
                  {aiLoading === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-navy-500 text-sm">
          No templates match your filters. Try clearing some filters.
        </div>
      )}
    </div>
  );
}
