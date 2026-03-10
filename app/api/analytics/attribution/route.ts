import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const since = new Date();
  since.setDate(since.getDate() - days);

  const admin = createAdminClient();

  const [{ data: leads }, { data: demos }] = await Promise.all([
    admin
      .from('leads')
      .select('utm_source, utm_medium, utm_campaign, status, created_at')
      .gte('created_at', since.toISOString()),
    admin
      .from('demo_bookings')
      .select('created_at')
      .gte('created_at', since.toISOString()),
  ]);

  const allLeads = leads || [];
  const totalLeads = allLeads.length;
  const totalDemos = demos?.length ?? 0;

  // UTM source breakdown
  const sourceMap: Record<string, { leads: number; demos: number }> = {};
  for (const lead of allLeads) {
    const src = lead.utm_source || 'direct';
    if (!sourceMap[src]) sourceMap[src] = { leads: 0, demos: 0 };
    sourceMap[src].leads++;
    if (lead.status === 'won') sourceMap[src].demos++;
  }
  const utmSources = Object.entries(sourceMap)
    .map(([utm_source, v]) => ({
      utm_source,
      visitors: v.leads, // proxy: each lead = one tracked visitor
      leads: v.leads,
      demos: v.demos,
      conversion_rate: v.leads > 0 ? `${((v.demos / v.leads) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // Campaign breakdown
  const campaignMap: Record<string, { leads: number; demos: number }> = {};
  for (const lead of allLeads) {
    if (!lead.utm_campaign) continue;
    if (!campaignMap[lead.utm_campaign]) campaignMap[lead.utm_campaign] = { leads: 0, demos: 0 };
    campaignMap[lead.utm_campaign].leads++;
    if (lead.status === 'won') campaignMap[lead.utm_campaign].demos++;
  }
  const topCampaigns = Object.entries(campaignMap)
    .map(([utm_campaign, v]) => ({ utm_campaign, ...v }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // Medium breakdown
  const mediumMap: Record<string, number> = {};
  for (const lead of allLeads) {
    const med = lead.utm_medium || 'none';
    mediumMap[med] = (mediumMap[med] || 0) + 1;
  }
  const topMediums = Object.entries(mediumMap)
    .map(([utm_medium, leads]) => ({ utm_medium, leads }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // Daily trend
  const trend: Array<{ date: string; leads: number; demos: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLeads = allLeads.filter((l) => l.created_at?.startsWith(dateStr)).length;
    trend.push({
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      leads: dayLeads,
      demos: 0,
    });
  }

  return NextResponse.json({
    utmSources,
    topCampaigns,
    topMediums,
    trend,
    totals: {
      leads: totalLeads,
      demos: totalDemos,
      conversion_rate: totalLeads > 0 ? `${((totalDemos / totalLeads) * 100).toFixed(1)}%` : '0%',
    },
  });
}
