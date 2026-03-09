import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().default(1),
  unit_price: z.number(),
  amount: z.number(),
});

const InvoiceSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_address: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  line_items: z.array(LineItemSchema).default([]),
  billing_period_start: z.string().optional(),
  billing_period_end: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
});

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${year}${month}-${random}`;
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const summary = {
    total: data?.reduce((a, i) => a + Number(i.amount), 0) || 0,
    paid: data?.filter((i) => i.status === 'paid').reduce((a, i) => a + Number(i.amount), 0) || 0,
    outstanding: data?.filter((i) => ['sent', 'overdue'].includes(i.status)).reduce((a, i) => a + Number(i.amount), 0) || 0,
    count: data?.length || 0,
  };

  return NextResponse.json({ invoices: data || [], summary });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = InvoiceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('invoices')
    .insert({
      ...parsed.data,
      user_id: user.id,
      invoice_number: generateInvoiceNumber(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updates: Record<string, unknown> = { ...rest };
  if (rest.status === 'paid' && !rest.paid_at) {
    updates.paid_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from('invoices').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
