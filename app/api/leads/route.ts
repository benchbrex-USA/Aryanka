import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/resend/email';
import { z } from 'zod';

const LeadSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().default('website'),
  type: z.enum(['signup', 'lead_magnet', 'newsletter', 'contact']).default('signup'),
  metadata: z.record(z.unknown()).optional(),
  // UTM attribution
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  referrer_url: z.string().optional(),
  page_url: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // Upsert lead (avoid duplicates by email)
    const { data: lead, error } = await supabase
      .from('leads')
      .upsert(
        {
          email: data.email,
          name: data.name,
          company: data.company,
          phone: data.phone,
          source: data.utm_source || data.source,
          type: data.type,
          metadata: data.metadata ?? {},
          status: 'new',
          score: calculateLeadScore(data),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          utm_content: data.utm_content,
          utm_term: data.utm_term,
          referrer_url: data.referrer_url || req.headers.get('referer'),
          page_url: data.page_url,
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'lead_captured',
      lead_id: lead.id,
      source: data.source,
      metadata: { type: data.type },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(data.email, data.name).catch(console.error);

    return NextResponse.json({ success: true, lead: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const format = searchParams.get('format');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // CSV export — fetch all leads (no pagination)
  if (format === 'csv') {
    let csvQuery = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (status) csvQuery = csvQuery.eq('status', status);
    if (source) csvQuery = csvQuery.eq('source', source);

    const { data, error } = await csvQuery;
    if (error) return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });

    const rows: string[] = [
      ['Name', 'Email', 'Company', 'Phone', 'Source', 'Status', 'Score', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Date'].join(','),
    ];
    for (const l of data || []) {
      rows.push([
        l.name || '',
        l.email,
        l.company || '',
        l.phone || '',
        l.source || '',
        l.status || '',
        String(l.score || 0),
        l.utm_source || '',
        l.utm_medium || '',
        l.utm_campaign || '',
        l.created_at ? l.created_at.split('T')[0] : '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }

    return new NextResponse(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="aryanka-leads.csv"',
      },
    });
  }

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }

  return NextResponse.json({ leads: data, total: count, page, limit });
}

function calculateLeadScore(data: {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  source: string;
  type: string;
}): number {
  let score = 10;
  if (data.name) score += 10;
  if (data.company) score += 20;
  if (data.phone) score += 15;
  if (!data.email.includes('gmail') && !data.email.includes('yahoo') && !data.email.includes('hotmail')) score += 25; // Work email
  if (data.source === 'demo') score += 30;
  if (data.type === 'lead_magnet') score += 15;
  return Math.min(score, 100);
}
