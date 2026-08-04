"use client";

import { useEffect, useState } from "react";
import i18n from "@/i18n";
import CookieConsentBanner from "./CookieConsentBanner";
import CookiePreferencesModal from "./CookiePreferencesModal";
import TrackingScripts from "./TrackingScripts";

const CONSENT_KEY = "cookie-consent";
const CONSENT_VERSION = 2;

function buildConsent({ analytics = false }) {
  return {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      analytics,
    },
  };
}

function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
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
  const [mounted, setMounted] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);
  const [consent, setConsent] = useState(null);
  const [consentReady, setConsentReady] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
    setConsentReady(true);

    // Wait for i18n to be initialised — don't call useTranslation here
    // (this component renders above I18nProvider on first paint).
    if (i18n?.isInitialized) {
      setI18nReady(true);
      return;
    }

    const onInit = () => setI18nReady(true);
    i18n?.on?.("initialized", onInit);
    // Language change also implies i18n is up
    i18n?.on?.("languageChanged", onInit);

    return () => {
      i18n?.off?.("initialized", onInit);
      i18n?.off?.("languageChanged", onInit);
    };
  }, []);

  const handleAcceptAll = () => {
    const c = buildConsent({ analytics: true });
    saveConsent(c);
    setConsent(c);
  };

  const handleRejectAll = () => {
    const c = buildConsent({ analytics: false });
    saveConsent(c);
    setConsent(c);
    setPrefsOpen(false);
  };

  const handleSavePreferences = ({ analytics }) => {
    const c = buildConsent({ analytics });
    saveConsent(c);
    setConsent(c);
    setPrefsOpen(false);
  };

  // Tracking scripts can load as soon as we know consent — no i18n needed.
  const trackingScripts = consent?.categories
    ? <TrackingScripts categories={consent.categories} />
    : null;

  // Consent UI (banner + modal) BOTH need i18n. Hold them until:
  //   1. Client hydration finished
  //   2. i18n instance is ready
  //   3. Consent snapshot has been read from localStorage
  const canRenderConsentUi = mounted && i18nReady && consentReady;

  const shouldShowBanner = canRenderConsentUi && !consent && !prefsOpen;

  return (
    <>
      {trackingScripts}

      {shouldShowBanner && (
        <CookieConsentBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onManage={() => setPrefsOpen(true)}
        />
      )}

      {canRenderConsentUi && (
        <CookiePreferencesModal
          open={prefsOpen}
          initialAnalytics={consent?.categories?.analytics ?? false}
          onClose={() => setPrefsOpen(false)}
          onSave={handleSavePreferences}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
        />
      )}
    </>
  );
}