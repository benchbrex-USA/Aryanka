import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Mock analytics generator — produces deterministic-looking but randomised data
// seeded from the token so values are stable across requests for the same report.
function generateMockAnalytics(token: string, reportType: string) {
  // Simple hash to seed pseudo-random numbers from the token string
  const seed = token.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const r = (min: number, max: number, offset = 0) =>
    min + ((seed + offset) % (max - min + 1));

  const openRate = r(28, 68, 1);
  const clickRate = r(4, 22, 2);
  const totalLeads = r(120, 3800, 3);

  const sources = [
    { source: 'Organic Search', leads: r(30, 900, 4) },
    { source: 'Direct', leads: r(20, 600, 5) },
    { source: 'Email Campaign', leads: r(15, 500, 6) },
    { source: 'LinkedIn', leads: r(10, 400, 7) },
    { source: 'Referral', leads: r(5, 300, 8) },
  ].sort((a, b) => b.leads - a.leads);

  return {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    metrics: {
      open_rate: openRate,
      click_rate: clickRate,
      total_leads: totalLeads,
      conversion_rate: r(2, 12, 9),
      emails_sent: r(500, 15000, 10),
      bounced: r(0, 3, 11),
    },
    top_sources: sources,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  const admin = createAdminClient();
  const { data: reportToken, error } = await admin
    .from('report_tokens')
    .select('id, token, user_id, report_name, report_type, config, expires_at, created_at')
    .eq('token', token)
    .single();

  if (error || !reportToken) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Check expiry
  if (reportToken.expires_at && new Date(reportToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Report link has expired' }, { status: 410 });
  }

  const analytics = generateMockAnalytics(token, reportToken.report_type ?? 'analytics');

  return NextResponse.json({
    report: {
      id: reportToken.id,
      name: reportToken.report_name,
      type: reportToken.report_type,
      config: reportToken.config,
      created_at: reportToken.created_at,
      expires_at: reportToken.expires_at,
    },
    data: analytics,
  });
}
