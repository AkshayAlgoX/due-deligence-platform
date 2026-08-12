"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Shared layout for all marketing pages (pricing, docs, privacy, terms, contact).
 * Reuses same nav/footer as landing page.
 */
export default function MarketingLayout({ children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <MarketingNav scrolled={scrolled} />
      <main className="relative">{children}</main>
      <MarketingFooter />
    </div>
  );
}

function MarketingNav({ scrolled }) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-300/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5V6l-8-4z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Real Estate Due Diligence
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/60">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-8 items-center px-3 text-[13px] font-medium text-white/70 hover:text-white transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white text-black px-3 text-[13px] font-semibold hover:bg-white/90 transition-all"
          >
            Start free
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12 mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5V6l-8-4z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-white">
              Real Estate Due Diligence
            </span>
            <span className="text-[12px] text-white/30 ml-2">Built in Bengaluru · 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/50">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/security" className="hover:text-white transition">Security</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}