'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem('aryanka_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('aryanka_session', id);
  }
  return id;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua))                        return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua))   return 'mobile';
  return 'desktop';
}

export default function VisitorTracker() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const tracked     = useRef<Set<string>>(new Set());

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);

    const sessionId  = getOrCreateSessionId();
    const utm_source   = searchParams.get('utm_source')   || undefined;
    const utm_medium   = searchParams.get('utm_medium')   || undefined;
    const utm_campaign = searchParams.get('utm_campaign') || undefined;
    const utm_content  = searchParams.get('utm_content')  || undefined;
    const utm_term     = searchParams.get('utm_term')     || undefined;

    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page: pathname,
        page_title: document.title,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        referrer: document.referrer || undefined,
        device_type: getDeviceType(),
      }),
    });
  }, [pathname, searchParams]);

  return null;
}
