/**
 * i18n configuration — react-i18next with lazy-loaded language files.
 *
 * Design decisions:
 *  - Default language: English (en)
 *  - Persistence: localStorage key "i18n_lang"
 *  - Lazy loading: each language JSON is imported on-demand so the initial
 *    bundle only ships English. Additional languages load only when selected.
 *  - RTL-ready: direction is stored alongside language so future RTL languages
 *    (Arabic, Hebrew) work without architectural changes.
 *  - Backend user preference: if the auth layer provides a preferredLanguage,
 *    call i18n.changeLanguage(preferredLanguage) after login — this file
 *    handles the rest automatically.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ── Supported languages ───────────────────────────────────────────────────
// Add new languages here — the rest of the system picks them up automatically.
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English",    nativeLabel: "English",    dir: "ltr" },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",       dir: "ltr" },
  { code: "te", label: "Telugu",     nativeLabel: "తెలుగు",      dir: "ltr" },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்",       dir: "ltr" },
  { code: "kn", label: "Kannada",    nativeLabel: "ಕನ್ನಡ",       dir: "ltr" },
  { code: "ml", label: "Malayalam",  nativeLabel: "മലയാളം",     dir: "ltr" },
  { code: "mr", label: "Marathi",    nativeLabel: "मराठी",       dir: "ltr" },
  { code: "bn", label: "Bengali",    nativeLabel: "বাংলা",       dir: "ltr" },
  { code: "gu", label: "Gujarati",   nativeLabel: "ગુજરાતી",     dir: "ltr" },
  { code: "pa", label: "Punjabi",    nativeLabel: "ਪੰਜਾਬੀ",      dir: "ltr" },
  { code: "ur", label: "Urdu",       nativeLabel: "اردو",        dir: "rtl" },
];

export const LANGUAGE_STORAGE_KEY = "i18n_lang";
export const DEFAULT_LANGUAGE = "en";

// ── Lazy resource loader ───────────────────────────────────────────────────
// Each call returns a promise so i18next only loads what it needs.
const lazyResources = {
  en: () => import("../locales/en/translation.json"),
  hi: () => import("../locales/hi/translation.json"),
  te: () => import("../locales/te/translation.json"),
  ta: () => import("../locales/ta/translation.json"),
  kn: () => import("../locales/kn/translation.json"),
  ml: () => import("../locales/ml/translation.json"),
  mr: () => import("../locales/mr/translation.json"),
  bn: () => import("../locales/bn/translation.json"),
  gu: () => import("../locales/gu/translation.json"),
  pa: () => import("../locales/pa/translation.json"),
  ur: () => import("../locales/ur/translation.json"),
};

// Load English eagerly (always needed) and other languages on demand.
async function loadLanguage(lang) {
  if (!lazyResources[lang]) return null;
  const module = await lazyResources[lang]();
  return module.default ?? module;
}

// ── Determine initial language ─────────────────────────────────────────────
function getInitialLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && lazyResources[stored]) return stored;
  // Fall back to browser language if supported
  const browser = navigator.language?.split("-")[0];
  if (browser && lazyResources[browser]) return browser;
  return DEFAULT_LANGUAGE;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
let initialized = false;

export async function initI18n() {
  if (initialized) return;
  initialized = true;

  const initialLang = getInitialLanguage();

  // Load English + the initial language (may be same)
  const [enTranslations, initialTranslations] = await Promise.all([
    loadLanguage("en"),
    initialLang !== "en" ? loadLanguage(initialLang) : Promise.resolve(null),
  ]);

  const resources = {
    en: { translation: enTranslations },
  };

  if (initialLang !== "en" && initialTranslations) {
    resources[initialLang] = { translation: initialTranslations };
  }

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false, // React already escapes
      },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ["localStorage"],
      },
      react: {
        useSuspense: false, // Prevents Suspense boundary requirement
      },
    });
}

/**
 * Change language at runtime — loads translation lazily if not yet loaded,
 * persists to localStorage, and updates document direction for RTL languages.
 */
export async function changeLanguage(langCode) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  if (!lang) return;

  // Lazy-load if not already in the bundle
  if (!i18n.hasResourceBundle(langCode, "translation")) {
    const translations = await loadLanguage(langCode);
    if (translations) {
      i18n.addResourceBundle(langCode, "translation", translations, true, true);
    }
  }

  await i18n.changeLanguage(langCode);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);

  // Update document direction for RTL support
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("dir", lang.dir);
    document.documentElement.setAttribute("lang", langCode);
  }
}

export default i18n;
