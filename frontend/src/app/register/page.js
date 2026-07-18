"use client";

import RegisterForm from "@/components/forms/RegisterForm";
import GuestGuard from "@/components/GuestGuard";
import { ShieldCheck, TrendingUp, Users, Award } from "lucide-react";

// Honest feature cards — no fake numbers, real value props
const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description: "256-bit AES encryption on every document and transaction record.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Risk Analysis",
    description: "Instant flags on ownership disputes, encumbrances & title gaps.",
  },
  {
    icon: Award,
    title: "Verified Data Sources",
    description: "Cross-referenced against government registries and municipal records.",
  },
  {
    icon: Users,
    title: "Multi-Role Collaboration",
    description: "Buyers, agents, legal reviewers & financial institutions — one platform.",
  },
];

function RegisterPageInner() {
  return (
    <main className="min-h-screen flex bg-[#edf7f3]">

      {/* ── LEFT — scrollable form panel ───────────────────────── */}
      <section className="
        relative z-10
        w-full lg:w-[52%] xl:w-[48%]
        flex flex-col
        bg-[#f8fffb]
        min-h-screen
        overflow-y-auto
      ">
        {/*
          This inner div is what centers the form card.
          - flex-1 + flex + items-center + justify-center handles true centering
          - py-10 gives breathing room when form is taller than viewport
          - px-6 / md:px-12 / lg:px-16 for responsive gutters
        */}
        <div className="
          flex flex-1 items-center justify-center
          px-6 py-10
          md:px-12
          lg:px-16
        ">
          <div className="w-full max-w-[480px]">
            <RegisterForm />
          </div>
        </div>
      </section>

      {/* ── RIGHT — hero panel (desktop only) ──────────────────── */}
      <section className="
        hidden lg:flex flex-1
        relative overflow-hidden
        items-end justify-start
        rounded-l-3xl
      ">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80')",
          }}
          aria-hidden="true"
        />

        {/* Dark gradient overlay — bottom-heavy so text is readable */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20"
          aria-hidden="true"
        />

        {/* Top-right system status badge */}
        <div className="absolute top-6 right-6 z-20">
          <span className="
            inline-flex items-center gap-1.5
            rounded-full bg-white/10 backdrop-blur-md
            border border-white/20
            px-4 py-1.5
            text-[10px] font-bold tracking-widest uppercase text-white
          ">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Platform
          </span>
        </div>

        

        {/* Bottom content card */}
        <div className="relative z-10 m-8 xl:m-12 w-full max-w-sm">
          <div className="
            rounded-3xl
            border border-white/15
            bg-white/10 backdrop-blur-xl
            p-7
            shadow-[0_30px_80px_rgba(0,0,0,0.3)]
          ">
            {/* Headline */}
            <p className="text-[11px] font-bold tracking-widest uppercase text-green-400 mb-3">
              Why choose us
            </p>
            <h2 className="text-white font-black text-[22px] leading-tight tracking-tight mb-6">
              Everything you need for confident property decisions
            </h2>

            {/* Feature list */}
            <ul className="space-y-4">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="
                      mt-0.5 flex-shrink-0
                      w-7 h-7 rounded-lg
                      bg-green-500/20 border border-green-400/30
                      flex items-center justify-center
                    ">
                      <Icon className="h-3.5 w-3.5 text-green-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">
                        {item.title}
                      </p>
                      <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegisterPageInner />
    </GuestGuard>
  );
}