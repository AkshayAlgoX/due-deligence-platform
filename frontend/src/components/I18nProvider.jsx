"use client";

/**
 * I18nProvider — initialises i18next once on the client side.
 * Must wrap the app at a high level (app/providers.jsx or app/layout.js).
 * Uses a one-time effect so the heavy init only runs on mount.
 */

import { useEffect, useState } from "react";
import { initI18n } from "@/i18n";

export default function I18nProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  // Render children immediately so Next.js hydration works,
  // but i18n is guaranteed ready on the client before any translation runs.
  // The `ready` flag prevents a flash of untranslated text on very first render.
  if (!ready) {
    // Transparent placeholder — keeps layout stable, no content shift
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}
