import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/analytics/track — anonymous visitor tracking
// No PII stored. Session ID is client-generated random UUID.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      session_id,
      page,
      page_title,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      device_type,
    } = body as Record<string, string | undefined>;

    if (!page) return NextResponse.json({ ok: true }); // ignore empty

    // Detect device type from User-Agent if not provided
    const ua = req.headers.get('user-agent') || '';
    const detectedDevice = device_type || detectDevice(ua);

    // Country from Vercel headers (or Cloudflare)
    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      undefined;

    const admin = createAdminClient();
    await admin.from('visitor_sessions').insert({
      session_id,
      page,
      page_title,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      device_type: detectedDevice,
      country,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // silently succeed even on error
  }
}

function detectDevice(ua: string): string {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    return /iPad/i.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}
