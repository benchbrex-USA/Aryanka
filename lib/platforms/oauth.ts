// ============================================================
// Platform OAuth Configuration & Utilities
// ============================================================

export type Platform = 'linkedin' | 'twitter' | 'reddit' | 'youtube' | 'instagram';

export interface PlatformConfig {
  name: string;
  displayName: string;
  color: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getCallbackUrl(platform: Platform) {
  return `${getAppUrl()}/api/platforms/callback?platform=${platform}`;
}

export function getPlatformConfig(platform: Platform): PlatformConfig {
  const configs: Record<Platform, PlatformConfig> = {
    linkedin: {
      name: 'linkedin',
      displayName: 'LinkedIn',
      color: '#0A66C2',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    },
    twitter: {
      name: 'twitter',
      displayName: 'Twitter / X',
      color: '#000000',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    },
    reddit: {
      name: 'reddit',
      displayName: 'Reddit',
      color: '#FF4500',
      authUrl: 'https://www.reddit.com/api/v1/authorize',
      tokenUrl: 'https://www.reddit.com/api/v1/access_token',
      scopes: ['identity', 'submit', 'read'],
      clientId: process.env.REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    },
    youtube: {
      name: 'youtube',
      displayName: 'YouTube',
      color: '#FF0000',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    instagram: {
      name: 'instagram',
      displayName: 'Instagram',
      color: '#E1306C',
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      scopes: ['instagram_basic', 'instagram_content_publish'],
      clientId: process.env.INSTAGRAM_CLIENT_ID || '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    },
  };
  return configs[platform];
}

// ============================================================
// Build OAuth authorization URL
// ============================================================
export function buildAuthUrl(
  platform: Platform,
  state: string,
  codeChallenge?: string
): string {
  const config = getPlatformConfig(platform);
  const callbackUrl = getCallbackUrl(platform);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    scope: config.scopes.join(platform === 'youtube' ? ' ' : ' '),
    response_type: 'code',
    state,
  });

  // Twitter requires PKCE
  if (platform === 'twitter' && codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  // Reddit requires duration=permanent for refresh token
  if (platform === 'reddit') {
    params.set('duration', 'permanent');
  }

  // YouTube/Google: force account selection
  if (platform === 'youtube') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent select_account');
    params.set('include_granted_scopes', 'true');
  }

  return `${config.authUrl}?${params.toString()}`;
}

// ============================================================
// Exchange authorization code for access token
// ============================================================
export async function exchangeCodeForToken(
  platform: Platform,
  code: string,
  codeVerifier?: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}> {
  const config = getPlatformConfig(platform);
  const callbackUrl = getCallbackUrl(platform);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl,
    client_id: config.clientId,
  });

  if (platform === 'twitter' && codeVerifier) {
    body.set('code_verifier', codeVerifier);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Reddit & Twitter use Basic Auth for token exchange
  if (platform === 'reddit' || platform === 'twitter') {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else {
    body.set('client_secret', config.clientSecret);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed for ${platform}: ${text}`);
  }

  return response.json();
}

// ============================================================
// Fetch platform user profile after token exchange
// ============================================================
export async function fetchPlatformProfile(
  platform: Platform,
  accessToken: string
): Promise<{
  platform_user_id: string;
  platform_username: string;
  platform_display_name: string;
  platform_avatar_url?: string;
  raw: object;
}> {
  switch (platform) {
    case 'linkedin': {
      const [profileRes, emailRes] = await Promise.all([
        fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);
      const profile = await profileRes.json();
      return {
        platform_user_id: profile.sub || profile.id,
        platform_username: profile.email || profile.sub,
        platform_display_name: `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || profile.name,
        platform_avatar_url: profile.picture,
        raw: profile,
      };
    }

    case 'twitter': {
      const res = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data } = await res.json();
      return {
        platform_user_id: data.id,
        platform_username: `@${data.username}`,
        platform_display_name: data.name,
        platform_avatar_url: data.profile_image_url,
        raw: data,
      };
    }

    case 'reddit': {
      const res = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Aryanka/1.0',
        },
      });
      const data = await res.json();
      return {
        platform_user_id: data.id,
        platform_username: `u/${data.name}`,
        platform_display_name: data.name,
        platform_avatar_url: data.icon_img,
        raw: data,
      };
    }

    case 'youtube': {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return {
        platform_user_id: data.id,
        platform_username: data.email,
        platform_display_name: data.name,
        platform_avatar_url: data.picture,
        raw: data,
      };
    }

    case 'instagram': {
      const res = await fetch(`https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`);
      const data = await res.json();
      return {
        platform_user_id: data.id,
        platform_username: `@${data.username}`,
        platform_display_name: data.name || data.username,
        platform_avatar_url: data.profile_picture_url,
        raw: data,
      };
    }
  }
}

// ============================================================
// PKCE helpers (for Twitter OAuth 2.0)
// ============================================================
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('base64url');
}
