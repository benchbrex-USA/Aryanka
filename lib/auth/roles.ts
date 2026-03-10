import type { SupabaseClient } from '@supabase/supabase-js';

export type Role = 'admin' | 'member' | 'viewer';

const ROLE_RANK: Record<Role, number> = { admin: 3, member: 2, viewer: 1 };

/**
 * Returns the user's highest role across all workspaces they belong to.
 * Returns null if the user has no workspace memberships.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<Role | null> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return null;

  // Return the highest role across all workspaces
  const roles = data.map((m) => m.role as Role);
  return roles.reduce((best, r) => {
    return (ROLE_RANK[r] || 0) > (ROLE_RANK[best] || 0) ? r : best;
  }, 'viewer' as Role);
}

/**
 * Returns true if the user has at least 'member' role (i.e., not viewer-only).
 * Viewers may not create, update, or delete resources.
 * If the user has no workspace membership, they are treated as admin of their own data.
 */
export async function canWrite(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, userId);
  // No workspace membership = user is the owner (allow)
  if (role === null) return true;
  return ROLE_RANK[role] >= ROLE_RANK['member'];
}
