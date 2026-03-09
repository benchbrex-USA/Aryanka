import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Platform } from '@/lib/platforms/oauth';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { platform } = await req.json() as { platform: Platform };

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('connected_platforms')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', platform);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
