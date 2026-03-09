// ============================================================
// Platform Content Posting / Syndication
// ============================================================

import type { Platform } from './oauth';

export interface PostContent {
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  subreddit?: string; // for Reddit posts
}

export interface PostResult {
  success: boolean;
  platform_post_id?: string;
  platform_post_url?: string;
  error?: string;
}

// ============================================================
// LinkedIn — UGC Post API
// ============================================================
async function postToLinkedIn(accessToken: string, platformUserId: string, content: PostContent): Promise<PostResult> {
  const body = {
    author: `urn:li:person:${platformUserId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `${content.title}\n\n${content.body}${content.url ? `\n\n${content.url}` : ''}`,
        },
        shareMediaCategory: content.url ? 'ARTICLE' : 'NONE',
        ...(content.url
          ? {
              media: [
                {
                  status: 'READY',
                  description: { text: content.body.substring(0, 200) },
                  originalUrl: content.url,
                  title: { text: content.title },
                },
              ],
            }
          : {}),
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `LinkedIn: ${err}` };
  }

  const data = await res.json();
  const postId = data.id?.replace('urn:li:ugcPost:', '');
  return {
    success: true,
    platform_post_id: data.id,
    platform_post_url: postId ? `https://www.linkedin.com/feed/update/${data.id}` : undefined,
  };
}

// ============================================================
// Twitter/X — v2 Tweets API
// ============================================================
async function postToTwitter(accessToken: string, content: PostContent): Promise<PostResult> {
  // Twitter has 280 char limit
  const text = `${content.title}\n\n${content.body}${content.url ? `\n\n${content.url}` : ''}`.substring(0, 280);

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Twitter: ${err}` };
  }

  const { data } = await res.json();
  return {
    success: true,
    platform_post_id: data.id,
    platform_post_url: `https://twitter.com/i/web/status/${data.id}`,
  };
}

// ============================================================
// Reddit — Submit Link/Text Post
// ============================================================
async function postToReddit(accessToken: string, content: PostContent): Promise<PostResult> {
  const subreddit = content.subreddit || 'test';
  const params = new URLSearchParams({
    sr: subreddit,
    kind: content.url ? 'link' : 'self',
    title: content.title,
    ...(content.url ? { url: content.url } : { text: content.body }),
    resubmit: 'true',
    nsfw: 'false',
    spoiler: 'false',
  });

  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Aryanka/1.0',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Reddit: ${err}` };
  }

  const data = await res.json();
  const postUrl = data?.jquery?.find((item: unknown[]) => Array.isArray(item) && item[3] === 'call' && Array.isArray(item[2]) && (item[2] as string[])[0]?.includes('reddit.com'))?.[2]?.[0];
  const postId = data?.json?.data?.id;

  return {
    success: true,
    platform_post_id: postId,
    platform_post_url: postUrl || (postId ? `https://www.reddit.com/r/${subreddit}/comments/${postId}` : undefined),
  };
}

// ============================================================
// YouTube — Community Post (requires channel ID)
// ============================================================
async function postToYouTube(accessToken: string, content: PostContent): Promise<PostResult> {
  // First get the authenticated channel ID
  const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!channelRes.ok) {
    return { success: false, error: 'YouTube: Could not retrieve channel information' };
  }

  const channelData = await channelRes.json();
  const channelId = channelData?.items?.[0]?.id;

  if (!channelId) {
    return { success: false, error: 'YouTube: No channel found for this account' };
  }

  // YouTube community posts via v3 API
  const postBody = {
    snippet: {
      channelId,
      type: 'textPost',
      textOriginalPost: {
        text: `${content.title}\n\n${content.body}${content.url ? `\n\n${content.url}` : ''}`,
      },
    },
  };

  const res = await fetch('https://www.googleapis.com/youtube/v3/communityPosts?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postBody),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `YouTube: ${err}` };
  }

  const data = await res.json();
  return {
    success: true,
    platform_post_id: data.id,
    platform_post_url: `https://www.youtube.com/post/${data.id}`,
  };
}

// ============================================================
// Instagram — Graph API Media Post
// ============================================================
async function postToInstagram(accessToken: string, platformUserId: string, content: PostContent): Promise<PostResult> {
  if (!content.imageUrl) {
    return { success: false, error: 'Instagram: An image URL is required for Instagram posts' };
  }

  // Step 1: Create a media container
  const containerParams = new URLSearchParams({
    image_url: content.imageUrl,
    caption: `${content.title}\n\n${content.body}${content.url ? `\n\n${content.url}` : ''}`.substring(0, 2200),
    access_token: accessToken,
  });

  const containerRes = await fetch(
    `https://graph.instagram.com/${platformUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams.toString(),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    return { success: false, error: `Instagram container creation failed: ${err}` };
  }

  const { id: containerId } = await containerRes.json();

  // Step 2: Publish the container
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const publishRes = await fetch(
    `https://graph.instagram.com/${platformUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishParams.toString(),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    return { success: false, error: `Instagram publish failed: ${err}` };
  }

  const { id: postId } = await publishRes.json();
  return {
    success: true,
    platform_post_id: postId,
    platform_post_url: `https://www.instagram.com/p/${postId}`,
  };
}

// ============================================================
// Medium — Publications API
// ============================================================
async function postToMedium(accessToken: string, platformUserId: string, content: PostContent): Promise<PostResult> {
  const body = {
    title: content.title,
    contentFormat: 'html',
    content: `<h1>${content.title}</h1><p>${content.body.replace(/\n/g, '</p><p>')}</p>${content.url ? `<p><a href="${content.url}">${content.url}</a></p>` : ''}`,
    publishStatus: 'public',
    tags: [],
  };

  const res = await fetch(`https://api.medium.com/v1/users/${platformUserId}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Medium: ${err}` };
  }

  const { data } = await res.json();
  return {
    success: true,
    platform_post_id: data.id,
    platform_post_url: data.url,
  };
}

// ============================================================
// Main dispatch function
// ============================================================
export async function postToPlatform(
  platform: Platform,
  accessToken: string,
  platformUserId: string,
  content: PostContent
): Promise<PostResult> {
  try {
    switch (platform) {
      case 'linkedin':
        return await postToLinkedIn(accessToken, platformUserId, content);
      case 'twitter':
        return await postToTwitter(accessToken, content);
      case 'reddit':
        return await postToReddit(accessToken, content);
      case 'youtube':
        return await postToYouTube(accessToken, content);
      case 'instagram':
        return await postToInstagram(accessToken, platformUserId, content);
      case 'medium':
        return await postToMedium(accessToken, platformUserId, content);
      default:
        return { success: false, error: `Unknown platform: ${platform}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
