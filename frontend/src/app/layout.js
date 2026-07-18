import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import Providers from "./providers";
import "./globals.css";
import CookieConsentRoot from "@/components/consent/CookieConsentRoot";

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
    "Enterprise property due diligence platform for buyers, agents, and institutions.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>

        {/* Global toast notifications — shown across all pages */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3500}
        />
        <CookieConsentRoot />
      </body>
    </html>
  );
}
