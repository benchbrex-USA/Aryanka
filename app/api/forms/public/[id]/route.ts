import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Public endpoint — no auth required — for embed forms to fetch their schema
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('custom_forms')
    .select('id, name, description, fields, button_text, success_message, is_active')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ form: null }, { status: 404 });
  }

  return NextResponse.json({ form: data });
}
