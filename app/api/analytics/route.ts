import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { event_type, page, metadata } = await req.json();
    const supabase = createAdminClient();

    await supabase.from('analytics_events').insert({
      event_type,
      page,
      metadata,
      ip_address: req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent'),
      referrer: req.headers.get('referer'),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const since = new Date();
  since.setDate(since.getDate() - days);

  const [{ data: events }, { data: leads }, { data: demos }] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('event_type, created_at, page, metadata')
      .gte('created_at', since.toISOString()),
    supabase
      .from('leads')
      .select('status, source, score, created_at, utm_source, utm_medium, utm_campaign')
      .gte('created_at', since.toISOString()),
    supabase
      .from('demo_bookings')
      .select('status, created_at')
      .gte('created_at', since.toISOString()),
  ]);

  // Aggregate stats
  const totalLeads = leads?.length ?? 0;
  const qualifiedLeads = leads?.filter((l) => l.status === 'qualified').length ?? 0;
  const totalDemos = demos?.length ?? 0;
  const avgScore = totalLeads > 0
    ? Math.round((leads!.reduce((acc, l) => acc + (l.score || 0), 0) / totalLeads))
    : 0;

  // Source breakdown
  const sourceBreakdown = leads?.reduce((acc: Record<string, number>, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {}) ?? {};

  // Daily leads trend (last N days)
  const dailyLeads: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = leads?.filter((l) => l.created_at.startsWith(dateStr)).length ?? 0;
    dailyLeads.push({ date: dateStr, count });
  }

  // UTM attribution breakdown
  const utmSourceBreakdown = leads?.reduce((acc: Record<string, number>, l) => {
    const key = l.utm_source || 'direct';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const utmMediumBreakdown = leads?.reduce((acc: Record<string, number>, l) => {
    const key = l.utm_medium || 'none';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const utmCampaignBreakdown = leads?.reduce((acc: Record<string, number>, l) => {
    if (!l.utm_campaign) return acc;
    acc[l.utm_campaign] = (acc[l.utm_campaign] || 0) + 1;
    return acc;
  }, {}) ?? {};

  return NextResponse.json({
    summary: {
      totalLeads,
      qualifiedLeads,
      totalDemos,
      avgLeadScore: avgScore,
      conversionRate: totalLeads > 0 ? ((totalDemos / totalLeads) * 100).toFixed(1) : '0',
    },
    sourceBreakdown,
    utmSourceBreakdown,
    utmMediumBreakdown,
    utmCampaignBreakdown,
    dailyLeads,
    events: events?.slice(0, 100),
  });
}
