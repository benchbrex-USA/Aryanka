import type { Metadata } from 'next';

const siteConfig = {
  name: 'Aryanka',
  description:
    'Aryanka is the all-in-one SaaS platform that automates your lead generation, content distribution, and customer pipeline — so you grow faster without spending on ads.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io',
  ogImage: '/api/og',
  keywords: [
    'SaaS platform',
    'lead generation',
    'B2B sales automation',
    'content syndication',
    'organic traffic',
    'CRM software',
    'email marketing',
    'marketing automation',
    'startup growth',
    'B2C marketing',
    'Aryanka',
  ],
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noIndex = false,
  path = '',
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  path?: string;
} = {}): Metadata {
  const metaTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — Grow Faster. Zero Ad Spend.`;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const canonicalUrl = `${siteConfig.url}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [...siteConfig.keywords, ...(keywords || [])].join(', '),
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@aryankaio',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

export { siteConfig };
