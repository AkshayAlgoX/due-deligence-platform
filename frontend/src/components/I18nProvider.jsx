"use client";

/**
 * I18nProvider — initialises i18next once on the client side.
 *
 * Must wrap the app at a high level (app/providers.jsx or app/layout.js).
 *
 * IMPORTANT: We do NOT render children until i18n is fully initialised.
 * Rendering children early (even hidden) causes every downstream
 * useTranslation() call to fire NO_I18NEXT_INSTANCE warnings, because
 * the hook runs on mount — visibility CSS doesn't prevent mounting.
 *
 * Since initI18n() is fast (~50-100ms on cold load, instant on warm cache),
 * the brief render delay is imperceptible to users and prevents:
 *   - Console warnings on every fresh page load
 *   - Flash of untranslated text (FOUT) on first paint
 *   - Race conditions in components that depend on t() at mount time
 */

import { useEffect, useState } from "react";
import { initI18n } from "@/i18n";

export default function I18nProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initI18n().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Do NOT mount children until i18n is ready.
  // Any component using useTranslation() would fire NO_I18NEXT_INSTANCE
  // warnings on cold-load if we render them early.
  if (!ready) {
    // Full-viewport transparent placeholder — prevents layout shift while
    // preserving the space that children will eventually occupy.
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "transparent",
        }}
        aria-hidden="true"
      />
    );
  }

  return <>{children}</>;
}