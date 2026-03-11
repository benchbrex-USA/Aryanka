import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import NotificationBell from '@/components/dashboard/NotificationBell';
import NpsWidget from '@/components/dashboard/NpsWidget';
import type { WhiteLabelSettings } from '@/lib/white-label';
import { DEFAULT_BRANDING } from '@/lib/white-label';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let branding: WhiteLabelSettings = DEFAULT_BRANDING;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('white_label_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      branding = {
        company_name:       data.company_name       || DEFAULT_BRANDING.company_name,
        logo_url:           data.logo_url           || null,
        primary_color:      data.primary_color      || DEFAULT_BRANDING.primary_color,
        accent_color:       data.accent_color       || DEFAULT_BRANDING.accent_color,
        custom_domain:      data.custom_domain      || null,
        hide_powered_by:    data.hide_powered_by    ?? false,
        custom_footer_text: data.custom_footer_text || null,
      };
    }
  } catch {
    /* Use defaults if table doesn't exist yet */
  }

  const displayName  = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
  const initials     = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar user={user} branding={branding} />

      {/* ── Main column ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────── */}
        <header className="h-14 flex items-center justify-end px-4 sm:px-6 border-b border-white/[0.06] flex-shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <NotificationBell />

            {/* Divider */}
            <div className="w-px h-5 bg-white/[0.08] mx-1" />

            {/* User pill */}
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors duration-150 group">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
              >
                {initials}
              </div>
              <span className="hidden sm:block text-xs text-[#666] group-hover:text-[#a1a1a1] transition-colors max-w-[140px] truncate">
                {user.email}
              </span>
            </button>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          {children}
        </main>
      </div>

      {/* NPS widget */}
      <NpsWidget />
    </div>
  );
}
