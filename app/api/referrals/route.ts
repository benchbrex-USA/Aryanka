import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET /api/referrals — returns user's referral code + stats
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Get or create referral code
  let { data: ref } = await admin
    .from('referrals')
    .select('ref_code')
    .eq('referrer_user_id', user.id)
    .is('referee_email', null)  // the "owner" record has no referee
    .single();

  if (!ref) {
    // Generate a code from user id
    const code = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();
    const { data: newRef } = await admin
      .from('referrals')
      .insert({ referrer_user_id: user.id, ref_code: code })
      .select('ref_code')
      .single();
    ref = newRef;
  }

  // Get referral stats
  const { data: referrals } = await admin
    .from('referrals')
    .select('*')
    .eq('referrer_user_id', user.id)
    .not('referee_email', 'is', null);

  const stats = {
    ref_code: ref?.ref_code || '',
    total: (referrals || []).length,
    signed_up: (referrals || []).filter((r) => r.status !== 'pending').length,
    converted: (referrals || []).filter((r) => r.status === 'converted').length,
    referrals: referrals || [],
  };

  return NextResponse.json(stats);
}

// POST /api/referrals/track — called when someone signs up with a ref code
export async function POST(req: NextRequest) {
  try {
    const { ref_code, referee_email } = await req.json();
    if (!ref_code || !referee_email) {
      return NextResponse.json({ ok: true }); // ignore invalid
    }

    const admin = createAdminClient();

    // Find the referral owner
    const { data: ref } = await admin
      .from('referrals')
      .select('id, referrer_user_id')
      .eq('ref_code', ref_code.toUpperCase())
      .is('referee_email', null)
      .single();

    if (!ref) return NextResponse.json({ ok: true });

    // Record the referral
    await admin.from('referrals').insert({
      referrer_user_id: ref.referrer_user_id,
      ref_code: ref_code.toUpperCase(),
      referee_email,
      status: 'signed_up',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
