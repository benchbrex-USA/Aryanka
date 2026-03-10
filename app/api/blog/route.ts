import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { notifyAllAdmins } from '@/lib/notifications';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  cover_image: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  reading_time: z.number().default(5),
  published_at: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, status, tags, views, reading_time, published_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data, total: count, page, limit });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(parsed.data, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track analytics (fire and forget)
    void supabase.from('analytics_events').insert({
      event_type: 'blog_post_created',
      metadata: { slug: data.slug, status: data.status },
    });

    // Notify team when published
    if (data.status === 'published') {
      void notifyAllAdmins({
        type: 'blog_published',
        title: 'Blog post published',
        body: `"${data.title}" is now live`,
        link: `/blog/${data.slug}`,
        metadata: { slug: data.slug },
      });
    }

    return NextResponse.json({ success: true, post: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
