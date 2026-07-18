'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.gtag || !window.__ga4Loaded) return; // respect consent

    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : '');

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.origin + url,
      page_path: url,
    });
  }, [pathname, searchParams]);
}