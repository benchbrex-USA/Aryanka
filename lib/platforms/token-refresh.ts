import type { Platform } from './oauth';

interface RefreshResult {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
}

/**
 * Attempts to refresh an expired OAuth token for platforms that support it.
 * Returns new token info or throws if refresh fails / not supported.
 */
export async function refreshAccessToken(
  platform: Platform,
  refreshToken: string
): Promise<RefreshResult> {
  switch (platform) {
    case 'youtube': {
      // Google OAuth2 refresh
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
      const data = await res.json();
      return { access_token: data.access_token, expires_in: data.expires_in };
    }

    case 'reddit': {
      // Reddit OAuth2 refresh
      const credentials = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
      ).toString('base64');
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const res = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
          'User-Agent': 'Aryanka/1.0',
        },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`Reddit token refresh failed: ${res.status}`);
      const data = await res.json();
      return {
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token || refreshToken,
      };
    }

    case 'twitter': {
      // Twitter OAuth2 PKCE refresh
      const credentials = Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64');
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`Twitter token refresh failed: ${res.status}`);
      const data = await res.json();
      return {
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
      };
    }

    case 'linkedin':
    case 'instagram':
    case 'medium':
      throw new Error(`${platform} does not support token refresh — user must reconnect`);

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
