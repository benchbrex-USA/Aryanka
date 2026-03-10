import { createAdminClient } from './supabase/server';

export type NotificationType =
  | 'new_lead'
  | 'email_opened'
  | 'email_clicked'
  | 'demo_booked'
  | 'blog_published'
  | 'sequence_complete'
  | 'platform_connected'
  | 'team_joined';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates in-app notifications for all workspace admins + members.
 * Used from API routes when significant events occur (new lead, demo booked, etc.)
 */
export async function notifyAllAdmins(payload: NotificationPayload): Promise<void> {
  try {
    const admin = createAdminClient();

    // Get all users who are admin or member in any workspace
    const { data: members } = await admin
      .from('workspace_members')
      .select('user_id')
      .in('role', ['admin', 'member']);

    let userIds: string[] = members?.map((m) => m.user_id as string) ?? [];

    // Fallback: if no workspace members, notify ALL users (small team / single-user setup)
    if (userIds.length === 0) {
      // We can't list auth.users directly, skip notification silently
      return;
    }

    // Deduplicate
    userIds = Array.from(new Set(userIds));

    await Promise.allSettled(
      userIds.map((userId) =>
        admin.from('notifications').insert({
          user_id: userId,
          ...payload,
        })
      )
    );
  } catch {
    // Notifications are non-critical — never throw
  }
}

/**
 * Creates a notification for a specific user.
 */
export async function notifyUser(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from('notifications').insert({ user_id: userId, ...payload });
  } catch {
    // non-critical
  }
}
