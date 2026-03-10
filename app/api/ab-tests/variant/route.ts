import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '/';
  const element = searchParams.get('element') || 'cta_button';

  const admin = createAdminClient();

  // Find an active A/B test for this page + element
  const { data: test } = await admin
    .from('ab_tests')
    .select('*')
    .eq('page', page)
    .eq('element', element)
    .eq('status', 'running')
    .limit(1)
    .single();

  if (!test) {
    return NextResponse.json({ variant: null, test: null });
  }

  // Read or assign variant via cookie
  const cookieStore = cookies();
  const cookieKey = `ab_variant_${test.id}`;
  let variant = cookieStore.get(cookieKey)?.value as 'a' | 'b' | undefined;

  if (!variant) {
    // Random 50/50 assignment
    variant = Math.random() < 0.5 ? 'a' : 'b';
  }

  const variantData = variant === 'a' ? test.variant_a : test.variant_b;

  // Track impression (fire and forget)
  void (async () => {
    const col = variant === 'a' ? 'impressions_a' : 'impressions_b';
    const { data: current } = await admin.from('ab_tests').select(col).eq('id', test.id).single();
    await admin
      .from('ab_tests')
      .update({ [col]: ((current as Record<string, number>)?.[col] || 0) + 1 })
      .eq('id', test.id);
  })();

  const response = NextResponse.json({
    test_id: test.id,
    variant,
    config: variantData,
  });

  // Set variant cookie (30 days)
  response.cookies.set(cookieKey, variant, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    httpOnly: false, // readable by client for conversion tracking
  });

  return response;
}
