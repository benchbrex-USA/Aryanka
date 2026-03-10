'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Users, Mail, FileText, Calendar, Zap, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  new_lead:           Users,
  email_opened:       Mail,
  email_clicked:      Mail,
  demo_booked:        Calendar,
  blog_published:     FileText,
  sequence_complete:  Zap,
  platform_connected: Zap,
  team_joined:        Users,
};

const TYPE_COLOR: Record<string, string> = {
  new_lead:           'text-brand-400 bg-brand-500/10',
  email_opened:       'text-accent-400 bg-accent-500/10',
  email_clicked:      'text-accent-400 bg-accent-500/10',
  demo_booked:        'text-purple-400 bg-purple-500/10',
  blog_published:     'text-yellow-400 bg-yellow-500/10',
  sequence_complete:  'text-brand-400 bg-brand-500/10',
  platform_connected: 'text-green-400 bg-green-500/10',
  team_joined:        'text-blue-400 bg-blue-500/10',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen]             = useState(false);
  const [notifications, setNotifs]  = useState<Notification[]>([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const ref                         = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unread > 0) {
      // Mark all read when opening
      setTimeout(markAllRead, 1500);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-xl text-navy-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          style={{ background: '#0d1117' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-navy-400 hover:text-white transition-colors flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-navy-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-navy-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-navy-600 mx-auto mb-2" />
                <p className="text-sm text-navy-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell;
                const colorClass = TYPE_COLOR[n.type] || 'text-navy-400 bg-white/5';
                const inner = (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer ${!n.read ? 'bg-brand-500/[0.03]' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-snug ${n.read ? 'text-navy-300' : 'text-white'}`}>{n.title}</p>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />}
                      </div>
                      {n.body && <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-navy-600 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : inner;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
