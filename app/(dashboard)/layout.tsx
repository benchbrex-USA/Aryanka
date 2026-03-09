import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

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

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-navy-900 lg:pl-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
