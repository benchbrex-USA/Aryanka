import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Share2,
  Zap,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Users, label: 'Leads & CRM', href: '/dashboard/leads' },
  { icon: Share2, label: 'Content Syndication', href: '/dashboard/content' },
  { icon: Mail, label: 'Email Campaigns', href: '/dashboard/email' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'Blog & SEO', href: '/dashboard/blog' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Aryanka</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-navy-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-sm font-medium group"
            >
              <Icon className="w-4 h-4 group-hover:text-brand-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin</div>
              <div className="text-xs text-navy-500 truncate">admin@aryanka.io</div>
            </div>
            <LogOut className="w-4 h-4 text-navy-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-navy-900">
        {children}
      </main>
    </div>
  );
}
