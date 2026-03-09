import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { Clock, ArrowRight, Tag } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'Blog — Organic Growth Strategies',
  description: 'Expert guides on B2B/B2C lead generation, SEO, content syndication, and organic traffic growth — all free.',
  path: '/blog',
  keywords: ['b2b marketing blog', 'saas growth blog', 'lead generation tips', 'organic seo guide'],
});

const posts = [
  {
    title: 'How to Generate 500 B2B Leads Per Month Without Spending on Ads',
    slug: 'how-to-generate-b2b-leads-without-ads',
    excerpt: 'A step-by-step playbook for generating high-quality B2B leads through content marketing, SEO, and social syndication — zero ad budget required.',
    tags: ['Lead Generation', 'B2B', 'Organic Traffic'],
    readTime: 8,
    date: 'January 15, 2024',
    featured: true,
  },
  {
    title: 'The Ultimate Guide to Organic Traffic for SaaS in 2024',
    slug: 'organic-traffic-strategies-for-saas',
    excerpt: 'How fast-growing SaaS companies are driving tens of thousands of monthly visitors without a single paid click.',
    tags: ['SEO', 'SaaS', 'Content Marketing'],
    readTime: 10,
    date: 'January 10, 2024',
    featured: false,
  },
  {
    title: 'Content Syndication: The Complete Playbook for Maximum Reach',
    slug: 'content-syndication-guide-2024',
    excerpt: 'Learn how to repurpose a single piece of content across 6 platforms and multiply your organic reach without extra work.',
    tags: ['Content Syndication', 'LinkedIn', 'Reddit'],
    readTime: 7,
    date: 'January 5, 2024',
    featured: false,
  },
  {
    title: 'LinkedIn Lead Generation: The 2024 Playbook That Actually Works',
    slug: 'linkedin-lead-generation-playbook',
    excerpt: 'Forget cold outreach. Here is how to build an inbound LinkedIn funnel that delivers qualified leads to your inbox every week.',
    tags: ['LinkedIn', 'Lead Generation', 'B2B'],
    readTime: 9,
    date: 'December 28, 2023',
    featured: false,
  },
  {
    title: 'Email Nurture Sequences That Convert at 12%+ (With Templates)',
    slug: 'email-nurture-sequences-that-convert',
    excerpt: '5 battle-tested email sequence templates that warm up cold leads and guide them to a buying decision.',
    tags: ['Email Marketing', 'Lead Nurture', 'Conversion'],
    readTime: 6,
    date: 'December 20, 2023',
    featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Grow <span className="text-gradient">Organically</span>
          </h1>
          <p className="text-lg text-navy-300 max-w-xl mx-auto">
            Expert guides on B2B/B2C lead generation, SEO, and content marketing.
            All free. No fluff.
          </p>
        </div>

        {/* Featured post */}
        <Link href={`/blog/${featured.slug}`} className="block mb-10 group">
          <div className="bg-glass rounded-2xl p-8 hover:bg-white/8 transition-colors border border-white/5 hover:border-brand-500/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full">Featured</span>
              <span className="text-xs text-navy-500">{featured.date}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">
              {featured.title}
            </h2>
            <p className="text-navy-400 mb-4 max-w-2xl">{featured.excerpt}</p>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-navy-400 bg-white/5 px-2 py-1 rounded-md">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-navy-500 ml-auto">
                <Clock className="w-3 h-3" />{featured.readTime} min read
              </div>
            </div>
          </div>
        </Link>

        {/* Rest of posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="bg-glass rounded-xl p-6 h-full hover:bg-white/8 transition-colors border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-2 mb-3 text-xs text-navy-500">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-navy-400 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-navy-500 bg-white/5 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-500 group-hover:text-brand-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
