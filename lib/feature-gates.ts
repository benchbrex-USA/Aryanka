/**
 * Feature gating — enforces plan limits throughout the app.
 * Plans: starter (free) | pro | enterprise
 */

export const PLAN_LIMITS = {
  starter: {
    leads:          250,
    emailsPerMonth: 500,
    blogPosts:      5,
    platforms:      2,
    crmContacts:    100,
    teamMembers:    1,
    websites:       1,
  },
  pro: {
    leads:          Infinity,
    emailsPerMonth: 5000,
    blogPosts:      Infinity,
    platforms:      6,
    crmContacts:    Infinity,
    teamMembers:    10,
    websites:       5,
  },
  enterprise: {
    leads:          Infinity,
    emailsPerMonth: Infinity,
    blogPosts:      Infinity,
    platforms:      Infinity,
    crmContacts:    Infinity,
    teamMembers:    Infinity,
    websites:       Infinity,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type LimitKey = keyof typeof PLAN_LIMITS.starter;

export function getPlanLimits(plan: string) {
  if (plan === 'pro')        return PLAN_LIMITS.pro;
  if (plan === 'enterprise') return PLAN_LIMITS.enterprise;
  return PLAN_LIMITS.starter;
}

export function isWithinLimit(plan: string, key: LimitKey, current: number): boolean {
  const limits = getPlanLimits(plan);
  return current < limits[key];
}

export function getLimitExceededMessage(plan: string, key: LimitKey): string {
  const limits = getPlanLimits(plan);
  const limit = limits[key];
  const names: Record<LimitKey, string> = {
    leads:          'leads',
    emailsPerMonth: 'emails per month',
    blogPosts:      'blog posts',
    platforms:      'platforms',
    crmContacts:    'CRM contacts',
    teamMembers:    'team members',
    websites:       'websites',
  };
  return `You've reached the ${limit === Infinity ? 'maximum' : limit} ${names[key]} limit on your ${plan} plan. Upgrade to Pro to continue.`;
}

/**
 * Server-side gate check.
 * Returns { allowed: true } or { allowed: false, message: string, upgradeRequired: true }
 */
export async function checkLimit(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
  key: LimitKey
): Promise<{ allowed: boolean; message?: string; upgradeRequired?: boolean }> {
  try {
    // Get user's plan
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_plan, subscription_status')
      .eq('id', userId)
      .single();

    const plan = (profile?.subscription_plan as Plan) || 'starter';
    const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
    const effectivePlan = isActive ? plan : 'starter';

    const limits = getPlanLimits(effectivePlan);
    const limit = limits[key];

    if (limit === Infinity) return { allowed: true };

    // Count current usage
    let current = 0;
    if (key === 'leads') {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      current = count ?? 0;
    } else if (key === 'blogPosts') {
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'archived');
      current = count ?? 0;
    } else if (key === 'platforms') {
      const { count } = await supabase
        .from('connected_platforms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);
      current = count ?? 0;
    } else if (key === 'teamMembers') {
      const { count } = await supabase
        .from('workspace_members')
        .select('*', { count: 'exact', head: true });
      current = count ?? 0;
    }

    if (current >= limit) {
      return {
        allowed: false,
        message: getLimitExceededMessage(effectivePlan, key),
        upgradeRequired: true,
      };
    }

    return { allowed: true };
  } catch {
    // On error, allow the action (fail open)
    return { allowed: true };
  }
}
