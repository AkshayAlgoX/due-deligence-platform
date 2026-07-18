"use client";

import { useEffect } from "react";

/**
 * TrackingScripts — loads non-essential tracking ONLY after user consent.
 *
 * This is the "Prior Consent" principle of a CMP: no cookies fire, no
 * analytics load, until the user has explicitly opted in.
 *
 * Currently no tracking is wired up. When you add Google Analytics,
 * PostHog, Mixpanel, or marketing pixels, load them from here based
 * on the categories prop.
 */
export default function TrackingScripts({ categories }) {
  useEffect(() => {
    if (!categories) return;

    if (categories.analytics) {
      // Example: load analytics after consent
      // if (typeof window !== "undefined" && !window.__analyticsLoaded) {
      //   const script = document.createElement("script");
      //   script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXX";
      //   script.async = true;
      //   document.head.appendChild(script);
      //   window.__analyticsLoaded = true;
      // }
    }

    if (categories.marketing) {
      // Example: load marketing pixels after consent
      // Facebook Pixel, LinkedIn Insight Tag, etc.
    }
  }, [categories]);

  return null;
}