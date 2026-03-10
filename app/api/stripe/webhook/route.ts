import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createAdminClient();

  const updateSubscription = async (subscription: Stripe.Subscription) => {
    const userId = subscription.metadata?.supabase_user_id;
    if (!userId) return;

    const plan = subscription.metadata?.plan || 'pro';
    const status = subscription.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;
    const trialEnd = sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null;

    await admin.from('user_profiles').update({
      stripe_subscription_id: subscription.id,
      subscription_status: status === 'active' || status === 'trialing' ? status : 'canceled',
      subscription_plan: plan,
      subscription_period_end: periodEnd,
      trial_end: trialEnd,
    }).eq('id', userId);
  };

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await updateSubscription(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await admin.from('user_profiles').update({
          subscription_status: 'canceled',
          subscription_plan: 'starter',
          stripe_subscription_id: null,
        }).eq('id', userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const custId = invoice.customer as string;
      await admin.from('user_profiles').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', custId);
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateSubscription(sub);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
