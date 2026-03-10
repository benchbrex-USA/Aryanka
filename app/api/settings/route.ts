import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: wl } = await admin
    .from('white_label_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ profile: profile || {}, white_label: wl || {} });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, ...data } = body;
  const admin = createAdminClient();

  if (type === 'profile') {
    const { error } = await admin
      .from('user_profiles')
      .upsert({ id: user.id, full_name: data.full_name, bio: data.bio }, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === 'notifications') {
    const { error } = await admin
      .from('user_profiles')
      .upsert({
        id: user.id,
        notify_new_lead: data.new_lead,
        notify_demo_booked: data.demo_booked,
        notify_weekly_report: data.weekly_report,
        notify_high_score: data.lead_score_high,
      }, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === 'integrations') {
    const { error } = await admin
      .from('user_profiles')
      .upsert({
        id: user.id,
        slack_webhook_url: data.slack_webhook_url || null,
      }, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === 'white_label') {
    const { error } = await admin
      .from('white_label_settings')
      .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === 'email_domain') {
    const { error } = await admin
      .from('user_profiles')
      .upsert({ id: user.id, custom_email_domain: data.custom_email_domain || null }, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown settings type' }, { status: 400 });
}
