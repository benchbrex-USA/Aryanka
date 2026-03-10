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
        company_name:      data.company_name      || DEFAULT_BRANDING.company_name,
        logo_url:          data.logo_url          || null,
        primary_color:     data.primary_color     || DEFAULT_BRANDING.primary_color,
        accent_color:      data.accent_color      || DEFAULT_BRANDING.accent_color,
        custom_domain:     data.custom_domain     || null,
        hide_powered_by:   data.hide_powered_by   ?? false,
        custom_footer_text: data.custom_footer_text || null,
      };
    }
  } catch {
    // Use defaults if table doesn't exist yet
  }

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar user={user} branding={branding} />

      {/* Main content area with top bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — notification bell + user email */}
        <header className="h-14 flex items-center justify-end px-6 border-b border-white/[0.04] flex-shrink-0 bg-navy-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)', color: '#080808' }}>
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
              <span className="text-xs text-navy-400 max-w-[160px] truncate">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-navy-900">
          {children}
        </main>
      </div>

      {/* NPS widget — client component, shows after 7 days */}
      <NpsWidget />
    </div>
  );
}
