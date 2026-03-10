import { generateMetadata as genMeta } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/server';
import { marked } from 'marked';

// Static fallback posts for slugs not yet in DB
const STATIC_POSTS: Record<string, {
  title: string; excerpt: string; content: string;
  tags: string[]; reading_time: number; published_at: string; keywords: string[];
}> = {
  'how-to-generate-b2b-leads-without-ads': {
    title: 'How to Generate 500 B2B Leads Per Month Without Spending on Ads',
    excerpt: 'A step-by-step playbook for generating high-quality B2B leads through content marketing, SEO, and social syndication — zero ad budget required.',
    keywords: ['b2b lead generation', 'organic leads', 'lead generation without ads'],
    tags: ['Lead Generation', 'B2B', 'Organic Traffic'],
    reading_time: 8,
    published_at: '2024-01-15T00:00:00Z',
    content: `
## The Problem with Paid B2B Lead Generation

Most B2B companies are trapped in a pay-to-play cycle. They spend ₹5L–₹20L/month on Google Ads, LinkedIn Ads, and lead databases — and the moment they stop spending, leads dry up completely.

There's a better way.

## The Organic B2B Lead Machine

The most successful B2B companies use a combination of:

### 1. SEO-Optimized Content (Your 24/7 Sales Team)

Write detailed guides targeting high-intent keywords like:
- "best [your category] software"
- "[your category] alternatives to [competitor]"
- "how to [solve the problem you solve]"

Each ranking article can generate 50–200 leads/month passively.

### 2. LinkedIn Authority Content

Post 3–5 times per week with:
- **Problem-solution posts** — identify a pain, offer your insight
- **Case studies** — share measurable results (with permission)
- **Contrarian takes** — challenge conventional wisdom in your space

Consistency for 90 days = 5K–20K organic impressions/post.

### 3. Reddit/Community Engagement

Find subreddits where your buyers hang out. Contribute genuine value for 30 days before ever mentioning your product. Then when someone asks about your problem space, you're the most trusted voice.

### 4. The Content Syndication Multiplier

Write one excellent piece of content. Then:
- Publish on your blog (SEO)
- Post a thread on LinkedIn (professional reach)
- Submit to relevant subreddits (community reach)
- Publish on Medium (additional SEO + discovery)
- Create a Twitter/X thread (viral potential)

**One piece of content → 5 organic traffic sources.**

### 5. Lead Capture That Converts

Traffic means nothing without capture. You need:
- Exit-intent pop-ups offering lead magnets
- Embedded forms within blog content
- High-value CTAs ("Get the free template", not "Sign up")

## The Results

Companies implementing this system consistently see:
- **2–4x organic traffic growth** within 60 days
- **300–500 qualified leads/month** by month 3
- **Zero ongoing cost** after the initial content investment

Ready to implement this system automatically? That's exactly what Aryanka does.
    `,
  },
  'organic-traffic-strategies-for-saas': {
    title: 'The Ultimate Guide to Organic Traffic for SaaS in 2024',
    excerpt: 'How fast-growing SaaS companies are driving tens of thousands of monthly visitors without a single paid click.',
    keywords: ['organic traffic saas', 'saas seo strategy', 'content marketing saas'],
    tags: ['SEO', 'SaaS', 'Content Marketing'],
    reading_time: 10,
    published_at: '2024-01-10T00:00:00Z',
    content: `
## Why Organic Traffic is the Ultimate SaaS Growth Moat

Paid traffic rents attention. Organic traffic owns it.

The SaaS companies that dominate their categories — Ahrefs, Notion, Linear — built massive organic traffic engines first. The result: millions of monthly visitors, thousands of sign-ups, and virtually zero customer acquisition cost.

## The 5 Pillars of SaaS Organic Growth

### Pillar 1: Bottom-of-Funnel SEO

Target keywords that indicate purchase intent:
- "[Competitor] alternatives"
- "[Category] software for [industry]"
- "Best [tool type] for [use case]"

These visitors are ready to buy. Convert them with comparison pages and free trials.

### Pillar 2: Problem-Aware Content

Create content for people who have the problem you solve, but don't know your product exists yet:
- How-to guides
- Industry reports
- Template libraries

This builds top-of-funnel awareness at scale.

### Pillar 3: Programmatic SEO

Generate thousands of landing pages targeting long-tail variations:
- "[City] + [service]" pages
- "[Integration] + [tool]" pages
- "[Use case] + [industry]" pages

Done right, this alone can drive 100K+ monthly visitors.

### Pillar 4: Backlink Acquisition

The best free backlinks come from:
- Original research and data studies
- Free tools (calculators, generators)
- Guest posts on industry publications
- Product integrations that link back to you

### Pillar 5: Content Compounding

The key insight most SaaS companies miss: SEO is compounding. Content published today builds authority for years. Start now.

## Implementation with Aryanka

Aryanka automates pillars 1, 2, and 4 — generating SEO-optimized content, building backlinks through syndication, and tracking results in one dashboard.
    `,
  },
};

async function getPost(slug: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (data) {
      // Increment view count (fire and forget)
      void supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);
      return data;
    }
  } catch {
    // fall through to static
  }
  return STATIC_POSTS[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return genMeta({ title: 'Post Not Found', noIndex: true });

  return genMeta({
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords || post.tags || [],
    path: `/blog/${params.slug}`,
  });
}

export async function generateStaticParams() {
  return Object.keys(STATIC_POSTS).map((slug) => ({ slug }));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const publishedAt = post.published_at || post.created_at;

  return (
    <main className="min-h-screen bg-navy-900">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-white mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-navy-500">
          {publishedAt && <span>{formatDate(publishedAt)}</span>}
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min read</span>
          <div className="flex flex-wrap gap-1 ml-auto">
            {(post.tags || []).map((t: string) => (
              <span key={t} className="flex items-center gap-1 bg-white/5 text-navy-400 px-2 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
        <p className="text-lg text-navy-300 mb-10 leading-relaxed">{post.excerpt}</p>

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-navy-300 prose-p:leading-relaxed
            prose-li:text-navy-300
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: marked(post.content || '') as string }}
        />

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-brand-500/10 to-accent-500/10 border border-brand-500/20 rounded-2xl text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to implement this automatically?</h3>
          <p className="text-navy-300 mb-6 text-sm">
            Aryanka handles everything in this guide automatically — SEO, syndication, lead capture, nurture, and CRM.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="gradient" asChild>
              <Link href="/#book-demo">Start for Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog">Read More Guides</Link>
            </Button>
          </div>
        </div>

        {/* Share */}
        <div className="mt-8 flex items-center gap-3 pt-6 border-t border-white/5">
          <Share2 className="w-4 h-4 text-navy-500" />
          <span className="text-sm text-navy-500">Share this article</span>
        </div>
      </article>

      <Footer />
    </main>
  );
}
