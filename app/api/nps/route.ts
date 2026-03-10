import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET — check if user has already submitted NPS
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ submitted: false });

  const admin = createAdminClient();
  const { data } = await admin
    .from('nps_responses')
    .select('id, score, created_at')
    .eq('user_id', user.id)
    .single();

  // Also check account age (only show after 7 days)
  const createdAt = new Date(user.created_at);
  const daysSinceSignup = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return NextResponse.json({
    submitted: !!data,
    shouldShow: !data && daysSinceSignup >= 7,
    existing: data || null,
  });
}

// POST — submit NPS score
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { score, comment } = await req.json();
  if (typeof score !== 'number' || score < 0 || score > 10) {
    return NextResponse.json({ error: 'Score must be 0–10' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('nps_responses').upsert(
    { user_id: user.id, score, comment },
    { onConflict: 'user_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
