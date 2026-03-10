import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Cron: runs every 5 minutes to publish scheduled posts
export async function GET(req: NextRequest) {
  // Fail closed: if CRON_SECRET not configured, block all requests
  const cronSecret = process.env.CRON_SECRET;
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find posts due for publishing
  const { data: posts } = await admin
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'scheduled')
    .eq('approval_status', 'approved')
    .lte('scheduled_at', now)
    .limit(20);

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  let published = 0;
  let failed = 0;

  for (const post of posts) {
    // Mark as sending
    await admin.from('scheduled_posts').update({ status: 'publishing' }).eq('id', post.id);

    const errors: string[] = [];

    for (const platform of post.platforms as string[]) {
      const content = (post.platform_variants as Record<string, string>)?.[platform] || post.content;

      const body: Record<string, string> = {
        platform,
        title: post.title || '',
        body: content,
        url: post.blog_post_id
          ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io'}/blog/${post.blog_post_id}`
          : '',
        image_url: post.image_url || '',
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://aryanka.io'}/api/syndication/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-secret': process.env.CRON_SECRET || '' },
          body: JSON.stringify({ ...body, _user_id: post.user_id }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          errors.push(`${platform}: ${d.error || res.status}`);
        }
      } catch (e) {
        errors.push(`${platform}: network error`);
      }
    }

    if (errors.length === 0) {
      await admin.from('scheduled_posts').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', post.id);
      published++;
    } else {
      await admin.from('scheduled_posts').update({
        status: errors.length < (post.platforms as string[]).length ? 'partial' : 'failed',
        error_message: errors.join('; '),
        published_at: new Date().toISOString(),
      }).eq('id', post.id);
      failed++;
    }
  }

  return NextResponse.json({ published, failed, total: posts.length });
}
