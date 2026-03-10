import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  // Require authentication
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    report_name?: string;
    report_type?: string;
    config?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { report_name, report_type, config } = body;

  if (!report_name || typeof report_name !== 'string' || !report_name.trim()) {
    return NextResponse.json({ error: 'report_name is required' }, { status: 400 });
  }

  const validTypes = ['campaign', 'analytics', 'leads'] as const;
  type ReportType = (typeof validTypes)[number];
  const type: ReportType = validTypes.includes(report_type as ReportType)
    ? (report_type as ReportType)
    : 'analytics';

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('report_tokens')
    .insert({
      token,
      user_id: user.id,
      report_name: report_name.trim(),
      report_type: type,
      config: config ?? {},
      expires_at: expiresAt.toISOString(),
    })
    .select('id, token, expires_at')
    .single();

  if (error || !data) {
    console.error('Failed to create report token:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://aryanka.io';
  const shareUrl = `${appUrl}/reports/${data.token}`;

  return NextResponse.json(
    {
      token: data.token,
      share_url: shareUrl,
      expires_at: data.expires_at,
    },
    { status: 201 }
  );
}
