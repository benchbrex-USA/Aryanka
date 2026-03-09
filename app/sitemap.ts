import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/metadata';

const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/book-demo', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
];

// In production, fetch blog slugs from Supabase
const getBlogSlugs = async (): Promise<string[]> => {
  return [
    'how-to-generate-b2b-leads-without-ads',
    'organic-traffic-strategies-for-saas',
    'content-syndication-guide-2024',
    'linkedin-lead-generation-playbook',
    'email-nurture-sequences-that-convert',
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogSlugs = await getBlogSlugs();

  const blogPages = blogSlugs.map((slug) => ({
    url: `${siteConfig.url}/blog/${slug}`,
    lastModified: new Date(),
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
