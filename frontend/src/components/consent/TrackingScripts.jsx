'use client';

import { useEffect } from 'react';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

function loadGA4() {
  if (!GA4_ID) {
    console.warn('[GA4] NEXT_PUBLIC_GA4_MEASUREMENT_ID is not set. Skipping.');
    return;
  }
  if (window.__ga4Loaded) return; // prevent double-load

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_ID, {
    send_page_view: false,  // we fire manually — full control
    anonymize_ip: true,     // privacy default
  });

  window.__ga4Loaded = true;

  // Fire first pageview after script is ready
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
  });
}

function removeGA4() {
  if (!GA4_ID) return;

  // Wipe all GA4 cookies on rejection/withdrawal
  const cookieNames = [
    '_ga',
    '_gid',
    '_gat',
    `_ga_${GA4_ID.replace('G-', '')}`,
  ];

  cookieNames.forEach((name) => {
    // Try both with and without leading dot (covers subdomains)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });

  window.__ga4Loaded = false;
}

// CookieConsentRoot passes: categories={{ necessary, analytics, marketing }}
export default function TrackingScripts({ categories }) {
  useEffect(() => {
    if (categories?.analytics === true) {
      loadGA4();
    } else {
      removeGA4();
    }
  }, [categories?.analytics]); // only re-run when analytics consent changes

  return null;
}