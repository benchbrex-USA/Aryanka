import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { postToPlatform, type PostContent } from '@/lib/platforms/posting';
import type { Platform } from '@/lib/platforms/oauth';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    platform,
    blog_post_id,
    title,
    body,
    url,
    image_url,
    subreddit,
  } = await req.json() as {
    platform: Platform;
    blog_post_id?: string;
    title: string;
    body: string;
    url?: string;
    image_url?: string;
    subreddit?: string;
  };

  if (!platform || !title || !body) {
    return NextResponse.json({ error: 'platform, title, and body are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the user's access token for this platform
  const { data: connection, error: connErr } = await admin
    .from('connected_platforms')
    .select('access_token, platform_user_id, platform_username, token_expires_at')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (connErr || !connection) {
    return NextResponse.json(
      { error: `${platform} is not connected. Please connect your account first.` },
      { status: 400 }
    );
  }

  // Check token expiry (warn only — refresh not implemented here for simplicity)
  if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
    return NextResponse.json(
      { error: `Your ${platform} token has expired. Please reconnect your account.` },
      { status: 401 }
    );
  }

  const content: PostContent = { title, body, url, imageUrl: image_url, subreddit };

  // Post to platform
  const result = await postToPlatform(platform, connection.access_token, connection.platform_user_id || '', content);

  // Log to platform_posts table
  const { data: postRecord } = await admin
    .from('platform_posts')
    .insert({
      user_id: user.id,
      blog_post_id: blog_post_id || null,
      platform,
      platform_post_id: result.platform_post_id || null,
      platform_post_url: result.platform_post_url || null,
      title,
      content: body,
      status: result.success ? 'posted' : 'failed',
      error_message: result.error || null,
      posted_at: result.success ? new Date().toISOString() : null,
    })
    .select()
    .single();

  // Track analytics
  void admin.from('analytics_events').insert({
    event_type: 'content_syndicated',
    metadata: {
      platform,
      success: result.success,
      blog_post_id: blog_post_id || null,
    },
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, record: postRecord },
      { status: 422 }
    );
  }

  return NextResponse.json({
    success: true,
    platform_post_url: result.platform_post_url,
    platform_post_id: result.platform_post_id,
    record: postRecord,
  });
}
