"use client";

import RegisterForm from "@/components/forms/RegisterForm";
import GuestGuard from "@/components/GuestGuard";
import { ShieldCheck } from "lucide-react";

const FEATURES = [
  { title: "Property Verification" },
  { title: "Secure Due Diligence" },
  { title: "Enterprise Security" },
];

function RegisterPageInner() {
  return (
    <main className="min-h-screen flex bg-[#edf7f3]">

      {/* LEFT — form */}
      <section className="
        relative z-10 w-full lg:w-[46%] xl:w-[42%]
        flex items-start justify-center
        bg-[#f8fffb] px-6 py-10 md:px-10 lg:px-14
        overflow-y-auto
      ">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </section>

      {/* RIGHT — hero */}
      <section className="hidden lg:flex flex-1 relative overflow-hidden items-end justify-start rounded-l-3xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80')",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/45 via-slate-900/25 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute top-6 right-6 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-bold tracking-widest text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
        </div>

        <div className="relative z-10 m-10 xl:m-14 w-full max-w-md">
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-green-500/90 flex items-center justify-center shadow-lg shadow-green-500/30">
                <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Trusted Intelligence</h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Empowering 2,500+ real estate institutions worldwide
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-green-500/40">
                    ✓
                  </div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                </li>
              ))}
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