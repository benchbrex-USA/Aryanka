import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/metadata';
import { createAdminClient } from '@/lib/supabase/server';

const STATIC_FALLBACK_SLUGS = [
  'how-to-generate-b2b-leads-without-ads',
  'organic-traffic-strategies-for-saas',
  'content-syndication-guide-2024',
  'linkedin-lead-generation-playbook',
  'email-nurture-sequences-that-convert',
];

const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/book-demo', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
  { url: '/status', priority: 0.4, changeFrequency: 'daily' as const },
];

const getBlogSlugs = async (): Promise<{ slug: string; updated_at?: string }[]> => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // fall through to static
  }
  return STATIC_FALLBACK_SLUGS.map((slug) => ({ slug }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogEntries = await getBlogSlugs();

  const blogPages = blogEntries.map(({ slug, updated_at }) => ({
    url: `${siteConfig.url}/blog/${slug}`,
    lastModified: updated_at ? new Date(updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const pages = staticPages.map(({ url, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  return [...pages, ...blogPages];
}
