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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:z-50">Skip to main content</a>
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