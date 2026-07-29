"use client";

import Link from "next/link";

import RegisterForm from "@/components/forms/RegisterForm";
import GuestGuard from "@/components/GuestGuard";
import { ShieldCheck, ListChecks, KeyRound, Users } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ListChecks,
    title: "Verification-first listings",
    description:
      "Every property runs through a seven-point data-quality engine before it's marked verified.",
  },
  {
    icon: KeyRound,
    title: "Secure by default",
    description:
      "JWT sessions, BCrypt password hashing, and role-based access on every endpoint.",
  },
  {
    icon: Users,
    title: "Built for real teams",
    description:
      "Five distinct roles — buyer, agent, legal reviewer, financial institution, and admin.",
  },
  {
    icon: ShieldCheck,
    title: "Consent-first analytics",
    description:
      "Nothing loads until you opt in. Cookie preferences are honored strictly.",
  },
];

function RegisterPageInner() {
  return (
    <main className="min-h-screen flex bg-[#edf7f3] dark:bg-[#0d1117]">

      {/* ── Left — scrollable form panel ── */}
      <section className="
        relative z-10
        w-full lg:w-[52%] xl:w-[48%]
        flex flex-col
        bg-[#f8fffb] dark:bg-[#0d1117]
        min-h-screen
        overflow-y-auto
      ">
        <div className="
          flex flex-1 items-center justify-center
          px-6 py-10
          md:px-12
          lg:px-16
        ">
          <div className="w-full max-w-[480px]">
            <RegisterForm />

            {/* Security footer */}
            <div className="mt-4 border-t border-gray-200 dark:border-[#30363d] pt-3 text-center">
              <p className="text-[10px] text-gray-500 dark:text-[#6e7681]">
                Secure by design ·{" "}
                <Link
                  href="/security"
                  className="underline hover:text-[#22C55E] transition"
                >
                  Learn how
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right — hero panel (photo + glass card), unchanged ── */}
      <section className="
        hidden lg:flex flex-1
        relative overflow-hidden
        items-end justify-start
        rounded-l-3xl
      ">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80')",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20"
          aria-hidden="true"
        />

        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Platform online
          </div>
        </div>

        <div className="relative z-10 m-8 xl:m-12 w-full max-w-sm">
          <div className="
            rounded-3xl
            border border-white/15
            bg-white/10 backdrop-blur-xl
            p-7
            shadow-[0_30px_80px_rgba(0,0,0,0.3)]
          ">
            <p className="text-[11px] font-bold tracking-widest uppercase text-green-400 mb-3">
              Why this platform
            </p>
            <h2 className="text-white font-black text-[22px] leading-tight tracking-tight mb-6">
              Honest tooling for property due diligence
            </h2>
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