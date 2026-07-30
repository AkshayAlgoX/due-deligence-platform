import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import Providers from "./providers";
import "./globals.css";
import CookieConsentRoot from "@/components/consent/CookieConsentRoot";
import PageTracker from "@/components/PageTracker";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Real Estate Due Diligence Agent",
  description:
    "Property due diligence platform for buyers, agents, and institutions.",
};

/* ─────────────────────────────────────────────────────────────────────────────
   No-flash theme script — runs synchronously before first paint.
───────────────────────────────────────────────────────────────────────────── */
const themeInitScript = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark") {
    document.documentElement.classList.add("dark");
  } else if (t === "system" || !t) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }
} catch (e) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
}
`;

/* ────────────────────────────────────────────────────────────────────────
   No-flash i18n script — runs synchronously before first paint.
   ──────────────────────────────────────────────────────────────────────── */
const i18nInitScript = `
try {
  var lang = localStorage.getItem("i18n_lang") || "en";
  var rtlLangs = ["ur", "ar", "he", "fa"];
  var dir = rtlLangs.indexOf(lang) !== -1 ? "rtl" : "ltr";
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", dir);
} catch (e) {
  document.documentElement.setAttribute("lang", "en");
  document.documentElement.setAttribute("dir", "ltr");
}
`;

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: i18nInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:z-50"
        >
          Skip to main content
        </a>
        <NextTopLoader
          color="#22C55E"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #22C55E,0 0 5px #22C55E"
        />

        {/*
          ✅ ALL client components that need i18n / theme / auth
             MUST live INSIDE <Providers>.
             Previously CookieConsentRoot and PageTracker were
             siblings of <Providers>, so useTranslation() had no
             i18next instance and rendered raw keys.
        */}
        <Providers>
          {children}
          <PageTracker />
          <CookieConsentRoot />
        </Providers>

        {/* Toaster stays OUTSIDE — it renders portals and doesn't use i18n */}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              fontSize: "13px",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            className: "font-medium",
          }}
        />
      </body>
    </html>
  );
}