"use client";

import { useEffect, useState } from "react";
import { isAuthenticated } from "@/utils/helpers";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";



export default function LandingPage() {

      useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Force dark theme on landing
    document.documentElement.classList.add("dark");
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Scroll to hash section when arriving from another page ──
  // (e.g. /contact → "Features" → /#features). Next.js doesn't auto-scroll
  // to anchors on client-side navigation, so we do it after first paint.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden antialiased">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <Nav scrolled={scrolled} />
      <Hero />
      <TrustBar />
      <FeatureGrid />
      <ProductShowcase />
      <RiskScoreSection />
      <Testimonial />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */
function Nav({ scrolled }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!isAuthenticated());
  }, []);

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
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-500 text-[#0a0a0a] px-3.5 text-[13px] font-semibold hover:bg-emerald-400 transition-all"
            >
              Dashboard
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-emerald-500/[0.08] blur-[120px]" />
        <div className="absolute top-20 left-1/4 h-[300px] w-[600px] rounded-full bg-blue-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm pl-2 pr-4 py-1 text-[12px] mb-8"
        >
          <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
            New
          </span>
          <span className="text-white/70">
            Real-time flood risk data now live for 847 Indian cities
          </span>
          <svg viewBox="0 0 20 20" className="h-3 w-3 text-white/40" fill="currentColor">
            <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[44px] sm:text-[64px] md:text-[80px] leading-[1.02] font-semibold tracking-[-0.04em] mb-6"
        >
          Property risk,
          <br />
          <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            uncovered in seconds.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[17px] md:text-[19px] text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A due-diligence engine built for Indian real estate. Flood zones, legal disputes,
          tax history, zoning — one report. Six categories. Zero guesswork.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-white text-black h-11 px-5 text-[14px] font-semibold hover:bg-white/90 transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_10px_40px_-10px_rgba(16,185,129,0.5)]"
          >
            Analyze your first property
            <svg viewBox="0 0 20 20" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] h-11 px-5 text-[14px] font-medium text-white/80 hover:text-white transition-all"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7l5 3-5 3V7z" />
            </svg>
            Watch demo
          </Link>
        </motion.div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[12px] text-white/40"
        >
          Free forever · No card required · 3-minute setup
        </motion.p>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 md:mt-24 relative"
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* Hero product mockup */
function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow behind */}
      <div className="absolute inset-0 -top-10 bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Browser chrome */}
      <div className="relative rounded-t-xl border border-white/[0.08] border-b-0 bg-[#0f0f0f] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="ml-4 h-5 flex-1 max-w-md rounded bg-white/[0.03] flex items-center px-3">
            <span className="text-[11px] text-white/40 truncate">
              diligence.app/reports/2847
            </span>
          </div>
        </div>

        {/* Mock report content */}
        <div className="grid grid-cols-12 gap-4 p-6 min-h-[400px]">
          {/* Sidebar */}
          <div className="col-span-3 space-y-2">
            <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
            <div className="h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center px-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2" />
              <div className="h-2 w-16 rounded bg-emerald-400/60" />
            </div>
            <div className="h-8 rounded-md bg-white/[0.02] flex items-center px-2">
              <div className="h-2 w-20 rounded bg-white/10" />
            </div>
            <div className="h-8 rounded-md bg-white/[0.02] flex items-center px-2">
              <div className="h-2 w-14 rounded bg-white/10" />
            </div>
            <div className="h-8 rounded-md bg-white/[0.02] flex items-center px-2">
              <div className="h-2 w-24 rounded bg-white/10" />
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-9 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-64 rounded bg-white/10" />
                <div className="h-3 w-40 rounded bg-white/[0.06]" />
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <div className="text-[10px] text-emerald-300/70 mb-0.5">RISK SCORE</div>
                <div className="text-2xl font-bold text-emerald-300">23<span className="text-sm text-emerald-400/50">/100</span></div>
              </div>
            </div>

            {/* Chart area */}
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 h-40 relative overflow-hidden">
              <div className="absolute inset-4 flex items-end gap-1.5">
                {[45, 62, 38, 71, 55, 82, 48, 66, 74, 58, 90, 72].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div
                      className="rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400/60"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Risk factor grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Flood", value: "40", color: "emerald" },
                { label: "Legal", value: "20", color: "emerald" },
                { label: "Zoning", value: "5", color: "emerald" },
              ].map((f) => (
                <div key={f.label} className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-lg font-semibold text-white/90">{f.value}<span className="text-xs text-white/40">/100</span></div>
                  <div className="mt-2 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${f.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BAR
   ═══════════════════════════════════════════════════════════════ */
function TrustBar() {
  const items = [
    { number: "2,847", label: "properties analyzed" },
    { number: "6", label: "risk categories" },
    { number: "847", label: "cities covered" },
    { number: "< 30s", label: "median report time" },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.01]">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-[26px] font-semibold tracking-tight text-white mb-1">
              {item.number}
            </div>
            <div className="text-[12px] text-white/40 uppercase tracking-wider">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE GRID
   ═══════════════════════════════════════════════════════════════ */
function FeatureGrid() {
  const features = [
    {
      title: "Flood risk mapping",
      desc: "Live NDMA & CWC integration. Zone classification, water body proximity, historical flooding.",
      accent: "emerald",
    },
    {
      title: "Legal chain verification",
      desc: "Ownership type, registration age, permit history. Freehold vs leasehold vs POA — flagged.",
      accent: "blue",
    },
    {
      title: "Tax delinquency check",
      desc: "Municipal records per assessment year. Overdue, pending, and recent-default patterns.",
      accent: "amber",
    },
    {
      title: "Zoning conflicts",
      desc: "Residential in industrial? Restricted use? Low FAR? All caught before you sign.",
      accent: "purple",
    },
    {
      title: "Environmental scoring",
      desc: "Live CPCB air quality via WAQI. Noise levels, contamination, green cover analysis.",
      accent: "cyan",
    },
    {
      title: "Market context",
      desc: "Building age, condition, price-per-sqft outliers. Comparable properties in-area.",
      accent: "rose",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-4">
            What we analyze
          </div>
          <h2 className="text-[36px] md:text-[48px] leading-[1.1] font-semibold tracking-[-0.02em] mb-4">
            Six categories.
            <br />
            <span className="text-white/40">One weighted score.</span>
          </h2>
          <p className="text-[16px] text-white/60 leading-relaxed">
            Every risk factor has a source, a weight, and a recommendation.
            Nothing is hidden behind a black box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, desc, accent }) {
  const accentMap = {
    emerald: "from-emerald-500/20 to-transparent",
    blue: "from-blue-500/20 to-transparent",
    amber: "from-amber-500/20 to-transparent",
    purple: "from-purple-500/20 to-transparent",
    cyan: "from-cyan-500/20 to-transparent",
    rose: "from-rose-500/20 to-transparent",
  };

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accentMap[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      <div className="relative">
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${accentMap[accent]} border border-white/[0.06] mb-4`}>
          <div className={`h-1.5 w-1.5 rounded-full bg-${accent}-400`} />
        </div>
        <h3 className="text-[16px] font-semibold text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[14px] text-white/50 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT SHOWCASE
   ═══════════════════════════════════════════════════════════════ */
function ProductShowcase() {
  return (
    <section id="how" className="py-24 md:py-32 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              How it works
            </div>
            <h2 className="text-[36px] md:text-[48px] leading-[1.1] font-semibold tracking-[-0.02em] mb-6">
              Address in.
              <br />
              Verdict out.
            </h2>
            <div className="space-y-6 text-white/60">
              {[
                {
                  num: "01",
                  title: "Enter property address",
                  desc: "Or paste a listing URL. We geocode via Nominatim + verify via land registry.",
                },
                {
                  num: "02",
                  title: "We fetch across 12 data sources",
                  desc: "NDMA, CWC, CPCB, municipal tax, land records, permit databases — parallel calls.",
                },
                {
                  num: "03",
                  title: "Six-category risk report",
                  desc: "Weighted score 0-100. Every factor traceable. PDF export ready in seconds.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-5">
                  <div className="text-[13px] font-mono text-emerald-400/60 pt-1">
                    {step.num}
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">{step.title}</div>
                    <div className="text-[14px] leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-20 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            <ShowcaseCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard() {
  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-[#0f0f0f] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Report ID · 2847</div>
          <div className="text-[15px] font-semibold text-white">Villa 42, Whitefield</div>
          <div className="text-[12px] text-white/50">Bangalore, Karnataka 560066</div>
        </div>
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-right">
          <div className="text-[9px] text-emerald-300/70 uppercase tracking-wider mb-0.5">Overall</div>
          <div className="text-xl font-bold text-emerald-300 leading-none">LOW</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">23/100</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { label: "Flood risk", score: 40, level: "MEDIUM", weight: "25%" },
          { label: "Legal chain", score: 20, level: "LOW", weight: "20%" },
          { label: "Tax history", score: 0, level: "CLEAR", weight: "15%" },
          { label: "Zoning", score: 5, level: "LOW", weight: "15%" },
          { label: "Environmental", score: 35, level: "MEDIUM", weight: "15%" },
          { label: "Market", score: 15, level: "LOW", weight: "10%" },
        ].map((cat) => (
          <div key={cat.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-b-0">
            <div className="text-[12px] text-white/70 w-28">{cat.label}</div>
            <div className="flex-1 relative h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  cat.score < 25 ? "bg-emerald-400" :
                  cat.score < 50 ? "bg-amber-400" :
                  "bg-rose-400"
                }`}
                style={{ width: `${cat.score}%` }}
              />
            </div>
            <div className="text-[11px] text-white/40 w-12 text-right font-mono">{cat.score}</div>
            <div className="text-[9px] text-white/30 w-8 text-right font-mono">{cat.weight}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-white/40">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Generated 4 seconds ago
        </div>
        <div className="text-emerald-400/60 font-mono">v2.4.1</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RISK SCORE EXPLAINER
   ═══════════════════════════════════════════════════════════════ */
function RiskScoreSection() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-4">
          The scoring engine
        </div>
        <h2 className="text-[36px] md:text-[48px] leading-[1.1] font-semibold tracking-[-0.02em] mb-6">
          No black box.
          <br />
          <span className="text-white/40">No AI hallucinations.</span>
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
          Rule-based scoring across 6 weighted categories.
          Every point is traceable to a source and every conclusion is auditable.
          When data is unavailable, we add a conservative penalty instead of pretending zero risk.
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-5 font-mono text-[13px]">
          <span className="text-white/40">Overall</span>
          <span className="text-white/20">=</span>
          <ScoreChip color="emerald" label="Flood" pct="0.25" />
          <span className="text-white/30">+</span>
          <ScoreChip color="blue" label="Legal" pct="0.20" />
          <span className="text-white/30">+</span>
          <ScoreChip color="amber" label="Tax" pct="0.15" />
          <span className="text-white/30">+</span>
          <ScoreChip color="purple" label="Zoning" pct="0.15" />
          <span className="text-white/30">+</span>
          <ScoreChip color="cyan" label="Env" pct="0.15" />
          <span className="text-white/30">+</span>
          <ScoreChip color="rose" label="Market" pct="0.10" />
        </div>
      </div>
    </section>
  );
}

function ScoreChip({ color, label, pct }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${colorMap[color]}`}>
      {label} <span className="opacity-60">× {pct}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIAL
   ═══════════════════════════════════════════════════════════════ */
function Testimonial() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <svg viewBox="0 0 40 32" className="h-10 w-10 mx-auto mb-8 text-emerald-400/40" fill="currentColor">
          <path d="M12 32V16h-8v-8c0-4.4 3.6-8 8-8v4c-2.2 0-4 1.8-4 4v4h8v20h-4zm20 0V16h-8v-8c0-4.4 3.6-8 8-8v4c-2.2 0-4 1.8-4 4v4h8v20h-4z" />
        </svg>
        <blockquote className="text-[22px] md:text-[28px] leading-[1.4] font-medium tracking-tight text-white/90 mb-10">
          &ldquo;Caught a leasehold conversion issue on a ₹2.4Cr property I was about to buy.
          The zoning conflict flag alone saved me from a decade of litigation.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white">
            RK
          </div>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-white">Rohit Kapoor</div>
            <div className="text-[12px] text-white/50">Independent buyer · Bangalore</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-semibold tracking-[-0.03em] mb-6">
          Stop buying blind.
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
            Start with a report.
          </span>
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          It takes 30 seconds. Costs nothing. Might save you a lifetime of regret.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-white text-black h-12 px-6 text-[15px] font-semibold hover:bg-white/90 transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_-10px_rgba(16,185,129,0.6)]"
          >
            Create free account
            <svg viewBox="0 0 20 20" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg h-12 px-6 text-[15px] font-medium text-white/70 hover:text-white transition"
          >
            I already have an account →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
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
            <span className="text-[12px] text-white/30 ml-2">
              Built in Bengaluru · 2026
            </span>
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