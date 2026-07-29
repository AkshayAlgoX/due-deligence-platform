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
   Must be a plain string (not JSX) injected via dangerouslySetInnerHTML.
   Reads localStorage("theme") and applies "dark" class to <html> if needed.
   This prevents the white flash on dark-mode users' page load/refresh.
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* No-flash theme initializer — MUST be first script in <head> */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
        <Providers>{children}</Providers>

        {/*
          Global toast notifications.
          Bottom-right placement matches Stripe, Linear, Vercel, Discord.
          Dark theme feels premium and reads cleanly on both light/dark pages.
        */}
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
        {/* Route change tracking (consent-aware) */}
        <PageTracker />

        {/* Cookie CMP */}
        <CookieConsentRoot />
      </body>
    </html>
  );
}