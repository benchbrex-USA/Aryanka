import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
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
        company_name: data.company_name || DEFAULT_BRANDING.company_name,
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || DEFAULT_BRANDING.primary_color,
        accent_color: data.accent_color || DEFAULT_BRANDING.accent_color,
        custom_domain: data.custom_domain || null,
        hide_powered_by: data.hide_powered_by ?? false,
        custom_footer_text: data.custom_footer_text || null,
      };
    }
  } catch {
    // Use defaults if table doesn't exist yet
  }

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar user={user} branding={branding} />
      <main className="flex-1 overflow-y-auto bg-navy-900 lg:pl-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
