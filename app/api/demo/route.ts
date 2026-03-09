import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendDemoConfirmationEmail } from '@/lib/resend/email';
import { z } from 'zod';

const DemoSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  company: z.string().min(1, 'Company is required'),
  role: z.string().optional(),
  team_size: z.string().optional(),
  use_case: z.string().optional(),
  preferred_time: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DemoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // Save demo booking
    const { data: booking, error } = await supabase
      .from('demo_bookings')
      .insert({
        name: data.name,
        email: data.email,
        company: data.company,
        role: data.role,
        team_size: data.team_size,
        use_case: data.use_case,
        preferred_time: data.preferred_time,
        phone: data.phone,
        message: data.message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to book demo' }, { status: 500 });
    }

    // Also upsert as a high-value lead
    await supabase.from('leads').upsert(
      {
        email: data.email,
        name: data.name,
        company: data.company,
        phone: data.phone,
        source: 'demo',
        type: 'signup',
        status: 'qualified',
        score: 85,
      },
      { onConflict: 'email' }
    );

    // Track analytics
    await supabase.from('analytics_events').insert({
      event_type: 'demo_booked',
      metadata: { company: data.company, role: data.role },
    });

    // Send confirmation email
    sendDemoConfirmationEmail(
      data.email,
      data.name,
      data.company,
      data.preferred_time || 'We will reach out within 24 hours to confirm your slot'
    ).catch(console.error);

    return NextResponse.json(
      { success: true, booking: { id: booking.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Demo booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
