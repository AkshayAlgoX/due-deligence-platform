"use client";

import { useEffect, useState } from "react";
import CookieConsentBanner from "./CookieConsentBanner";
import CookiePreferencesModal from "./CookiePreferencesModal";
import TrackingScripts from "./TrackingScripts";

/**
 * CookieConsentRoot — the CMP orchestrator.
 *
 * Responsibilities:
 *  - Read/write consent to localStorage (versioned)
 *  - Show banner to first-time visitors only
 *  - Manage preferences modal
 *  - Gate tracking scripts behind consent (prior consent principle)
 */

const CONSENT_KEY = "cookie-consent";
const CONSENT_VERSION = 1;

function buildConsent({ analytics = false, marketing = false }) {
  return {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    categories: {
      necessary: true, // always on — required for the app to function
      analytics,
      marketing,
    },
  };
}

function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Version guard — if we bump the CMP schema, force re-consent
    if (parsed?.version !== CONSENT_VERSION) return null;
    if (!parsed?.categories) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(consent) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // localStorage might be blocked (private mode) — silently skip
  }
}

export default function CookieConsentRoot() {
  const [consent, setConsent] = useState(null);
  const [ready, setReady] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const shouldShowBanner = ready && !consent && !prefsOpen;

  const handleAcceptAll = () => {
    const c = buildConsent({ analytics: true, marketing: true });
    saveConsent(c);
    setConsent(c);
  };

  const handleRejectAll = () => {
    const c = buildConsent({ analytics: false, marketing: false });
    saveConsent(c);
    setConsent(c);
    setPrefsOpen(false);
  };

  const handleSavePreferences = ({ analytics, marketing }) => {
    const c = buildConsent({ analytics, marketing });
    saveConsent(c);
    setConsent(c);
    setPrefsOpen(false);
  };

  return (
    <>
      {/* Prior consent principle: tracking loads ONLY after choice */}
      {consent?.categories && <TrackingScripts categories={consent.categories} />}

      {shouldShowBanner && (
        <CookieConsentBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onManage={() => setPrefsOpen(true)}
        />
      )}

      <CookiePreferencesModal
        open={prefsOpen}
        initialAnalytics={consent?.categories?.analytics ?? false}
        initialMarketing={consent?.categories?.marketing ?? false}
        onClose={() => setPrefsOpen(false)}
        onSave={handleSavePreferences}
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
      />
    </>
  );
}