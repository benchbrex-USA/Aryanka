import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function enrichWithHunter(email: string): Promise<{ verified: boolean; score: number } | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      verified: d.data?.result === 'deliverable',
      score: d.data?.score || 0,
    };
  } catch {
    return null;
  }
}

async function enrichWithClearbit(email: string): Promise<{
  company?: string;
  company_size?: string;
  company_industry?: string;
  company_location?: string;
  company_website?: string;
  linkedin_url?: string;
} | null> {
  const domain = email.split('@')[1];
  if (!domain || ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) return null;

  // Clearbit Autocomplete is free for company lookup
  try {
    const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(domain)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const company = data[0];
    return {
      company: company.name,
      company_website: company.domain ? `https://${company.domain}` : undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lead_id, bulk } = await req.json();
  const admin = createAdminClient();

  if (bulk) {
    // Bulk enrich all leads missing data
    const { data: leads } = await admin
      .from('leads')
      .select('id, email, enriched_at')
      .is('enriched_at', null)
      .limit(50);

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'All leads already enriched', enriched: 0 });
    }

    let enriched = 0;
    for (const lead of leads) {
      const updates: Record<string, unknown> = { enriched_at: new Date().toISOString(), enrichment_source: 'clearbit+hunter' };

      const [hunterResult, clearbitResult] = await Promise.all([
        enrichWithHunter(lead.email as string),
        enrichWithClearbit(lead.email as string),
      ]);

      if (hunterResult) {
        updates.email_verified = hunterResult.verified;
      }
      if (clearbitResult) {
        if (clearbitResult.company) updates.company = clearbitResult.company;
        if (clearbitResult.company_size) updates.company_size = clearbitResult.company_size;
        if (clearbitResult.company_industry) updates.company_industry = clearbitResult.company_industry;
        if (clearbitResult.company_location) updates.company_location = clearbitResult.company_location;
        if (clearbitResult.company_website) updates.company_website = clearbitResult.company_website;
        if (clearbitResult.linkedin_url) updates.linkedin_url = clearbitResult.linkedin_url;
      }

      await admin.from('leads').update(updates).eq('id', lead.id);
      enriched++;
    }

    return NextResponse.json({ enriched, total: leads.length });
  }

  // Single lead enrich
  if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 });

  const { data: lead } = await admin.from('leads').select('*').eq('id', lead_id).single();
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updates: Record<string, unknown> = {
    enriched_at: new Date().toISOString(),
    enrichment_source: 'clearbit+hunter',
  };

  const [hunterResult, clearbitResult] = await Promise.all([
    enrichWithHunter(lead.email as string),
    enrichWithClearbit(lead.email as string),
  ]);

  if (hunterResult) {
    updates.email_verified = hunterResult.verified;
  }

  if (clearbitResult) {
    if (clearbitResult.company && !lead.company) updates.company = clearbitResult.company;
    if (clearbitResult.company_size) updates.company_size = clearbitResult.company_size;
    if (clearbitResult.company_industry) updates.company_industry = clearbitResult.company_industry;
    if (clearbitResult.company_location) updates.company_location = clearbitResult.company_location;
    if (clearbitResult.company_website) updates.company_website = clearbitResult.company_website;
    if (clearbitResult.linkedin_url) updates.linkedin_url = clearbitResult.linkedin_url;
  }

  const { data: updated } = await admin.from('leads').update(updates).eq('id', lead_id).select().single();

  const enrichedFields = Object.keys(updates).filter((k) => k !== 'enriched_at' && k !== 'enrichment_source');

  return NextResponse.json({
    lead: updated,
    enriched_fields: enrichedFields,
    email_verified: hunterResult?.verified ?? null,
    company_found: !!clearbitResult?.company,
  });
}
