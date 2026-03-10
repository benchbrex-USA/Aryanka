import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: campaigns } = await supabase
    .from('email_campaigns')
    .select('sent_at, open_rate, click_rate')
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })
    .limit(50);

  const dayPerf: Record<number, { opens: number; count: number }> = {};
  const hourPerf: Record<number, { opens: number; count: number }> = {};

  if (campaigns && campaigns.length > 0) {
    for (const c of campaigns) {
      if (!c.sent_at) continue;
      const d = new Date(c.sent_at);
      const day = d.getDay();
      const hour = d.getHours();
      const rate = c.open_rate || 0;
      if (!dayPerf[day]) dayPerf[day] = { opens: 0, count: 0 };
      dayPerf[day].opens += rate;
      dayPerf[day].count += 1;
      if (!hourPerf[hour]) hourPerf[hour] = { opens: 0, count: 0 };
      hourPerf[hour].opens += rate;
      hourPerf[hour].count += 1;
    }
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDay = Object.entries(dayPerf).sort(([, a], [, b]) => (b.opens / b.count) - (a.opens / a.count))[0];
  const bestHour = Object.entries(hourPerf).sort(([, a], [, b]) => (b.opens / b.count) - (a.opens / a.count))[0];
  const hasData = (campaigns?.length || 0) >= 5;

  return NextResponse.json({
    recommendations: [
      { label: 'Best Day', value: bestDay ? DAYS[parseInt(bestDay[0])] : 'Tuesday', confidence: hasData ? 'high' : 'low', source: hasData ? 'Your data' : 'Industry benchmark' },
      { label: 'Best Time', value: bestHour ? `${parseInt(bestHour[0])}:00` : '10:00 AM', confidence: hasData ? 'high' : 'low', source: hasData ? 'Your data' : 'Industry benchmark' },
      { label: 'Avoid', value: 'Friday after 3PM, Weekends', confidence: 'high', source: 'Industry benchmark' },
    ],
    industryBenchmarks: [
      { day: 'Tuesday', open_rate: '28.4%', best_time: '10 AM' },
      { day: 'Wednesday', open_rate: '27.1%', best_time: '2 PM' },
      { day: 'Thursday', open_rate: '26.8%', best_time: '10 AM' },
      { day: 'Monday', open_rate: '24.2%', best_time: '9 AM' },
    ],
    campaigns_analyzed: campaigns?.length || 0,
    has_enough_data: hasData,
  });
}
