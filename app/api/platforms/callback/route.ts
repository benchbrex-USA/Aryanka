import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  exchangeCodeForToken,
  fetchPlatformProfile,
  type Platform,
} from '@/lib/platforms/oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') as Platform;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard/content?error=${encodeURIComponent(error)}`);
  }

  if (!platform || !code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard/content?error=missing_params`);
  }

  // Verify state cookie (CSRF check)
  const storedState = request.cookies.get(`oauth_state_${platform}`)?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/dashboard/content?error=state_mismatch`);
  }

  // Require authenticated user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  try {
    // Get PKCE verifier for Twitter
    const codeVerifier = platform === 'twitter'
      ? request.cookies.get('twitter_code_verifier')?.value
      : undefined;

    // Exchange code for token
    const tokens = await exchangeCodeForToken(platform, code, codeVerifier);

    // Fetch platform user profile
    const profile = await fetchPlatformProfile(platform, tokens.access_token);

    // Calculate token expiry
    const tokenExpiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Upsert platform connection in DB (admin client bypasses RLS)
    const admin = createAdminClient();
    const { error: dbError } = await admin
      .from('connected_platforms')
      .upsert(
        {
          user_id: user.id,
          platform,
          platform_user_id: profile.platform_user_id,
          platform_username: profile.platform_username,
          platform_display_name: profile.platform_display_name,
          platform_avatar_url: profile.platform_avatar_url,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokenExpiresAt,
          scope: tokens.scope || null,
          raw_profile: profile.raw,
          is_active: true,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform' }
      );

    if (dbError) {
      console.error('Failed to save platform connection:', dbError);
      return NextResponse.redirect(`${appUrl}/dashboard/content?error=db_error`);
    }

    // Clear state cookies
    const response = NextResponse.redirect(`${appUrl}/dashboard/content?connected=${platform}`);
    response.cookies.delete(`oauth_state_${platform}`);
    if (platform === 'twitter') response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    const msg = err instanceof Error ? err.message : 'oauth_failed';
    return NextResponse.redirect(`${appUrl}/dashboard/content?error=${encodeURIComponent(msg)}`);
  }
}
