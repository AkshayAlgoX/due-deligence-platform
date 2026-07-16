"use client";

/**
 * /register — Registration page.
 *
 * Layout:
 *   Desktop  → Left: form  |  Right: real-estate hero image with glassmorphism card
 *   Mobile   → Single column (form on top)
 *
 * Mirrors the Login page design exactly.
 */
import RegisterForm from "@/components/forms/RegisterForm";

// ── Right-side feature card data ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🔍",
    title: "Property Verification",
    desc:  "Instant ownership, title, and deed record verification.",
  },
  {
    icon: "⚡",
    title: "Trusted Intelligence",
    desc:  "Empowering over 2,500 real estate institutions worldwide.",
  },
  {
    icon: "🔒",
    title: "Enterprise Grade Security",
    desc:  "ISO 27001 certified · SOC2 Type II compliant infrastructure.",
  },
  {
    icon: "📊",
    title: "Risk Assessment",
    desc:  "Automated legal, flood, tax, and zoning risk scoring.",
  },
  {
    icon: "📄",
    title: "Professional Due Diligence",
    desc:  "PDF & Excel reports for buyers, agents, and institutions.",
  },
];

const STATS = [
  { value: "98%",  label: "ACCURACY" },
  { value: "12M+", label: "REPORTS"  },
  { value: "$40B", label: "AUDITED"  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <main className="min-h-screen flex">

      {/* ════════════════════════════════════════════
          LEFT — Registration form panel
          ════════════════════════════════════════════ */}
      <section className="
        relative z-10 w-full lg:w-[46%] xl:w-[42%]
        flex items-start justify-center
        bg-gray-50 px-6 py-10 md:px-10 lg:px-14
        overflow-y-auto
      ">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          RIGHT — Hero image panel
          Hidden on mobile (< lg)
          ════════════════════════════════════════════ */}
      <section className="
        hidden lg:flex flex-1
        relative overflow-hidden
        items-end justify-start
      ">
        {/* Background: modern glass building (free Unsplash-style URL) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80')",
          }}
          aria-hidden="true"
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-transparent"
          aria-hidden="true"
        />

        {/* System Online badge */}
        <div className="absolute top-6 right-6 z-20">
          <span className="
            inline-flex items-center gap-1.5 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20
            px-3 py-1 text-xs font-semibold text-white
          ">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
        </div>

        {/* ── Glassmorphism info card ── */}
        <div className="relative z-10 m-8 xl:m-12 w-full max-w-sm">
          <div className="
            rounded-2xl border border-white/20
            bg-white/10 backdrop-blur-xl
            p-6 shadow-2xl
          ">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/80 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Trusted Intelligence</h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Empowering 2,500+ real estate institutions worldwide
                </p>
              </div>
            </div>

            {/* Feature list */}
            <ul className="space-y-2.5 mb-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-white/60 text-xs">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="border-t border-white/15 my-4" />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-white font-bold text-xl">{s.value}</p>
                  <p className="text-white/50 text-[10px] tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
