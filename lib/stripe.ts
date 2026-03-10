import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover' as const,
    });
  }
  return stripeInstance;
}

export const STRIPE_PLANS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
};

export const PLAN_LIMITS = {
  starter: {
    leads: 250,
    emailsPerMonth: 500,
    websites: 1,
    blogPosts: 5,
    platforms: 2,
    crmContacts: 100,
  },
  pro: {
    leads: Infinity,
    emailsPerMonth: 5000,
    websites: 5,
    blogPosts: Infinity,
    platforms: 6,
    crmContacts: Infinity,
  },
  enterprise: {
    leads: Infinity,
    emailsPerMonth: Infinity,
    websites: Infinity,
    blogPosts: Infinity,
    platforms: 6,
    crmContacts: Infinity,
  },
};
