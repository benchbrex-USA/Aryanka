import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  buildAuthUrl,
  generateCodeVerifier,
  generateCodeChallenge,
  type Platform,
} from '@/lib/platforms/oauth';

const VALID_PLATFORMS: Platform[] = ['linkedin', 'twitter', 'reddit', 'youtube', 'instagram'];

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const platform = params.platform as Platform;

  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  // Require authenticated user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Generate a random state value (CSRF protection)
  const state = crypto.randomUUID();

  // Build the response — we'll set cookies for state (and PKCE verifier for Twitter)
  let authUrl: string;
  const cookiesToSet: { name: string; value: string; options: object }[] = [
    {
      name: `oauth_state_${platform}`,
      value: state,
      options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' },
    },
  ];

  if (platform === 'twitter') {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    authUrl = buildAuthUrl(platform, state, codeChallenge);
    cookiesToSet.push({
      name: 'twitter_code_verifier',
      value: codeVerifier,
      options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' },
    });
  } else {
    authUrl = buildAuthUrl(platform, state);
  }

  const response = NextResponse.redirect(authUrl);
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
