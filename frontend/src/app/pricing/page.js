"use client";

import Link from "next/link";
import MarketingLayout from "@/components/landing/MarketingLayout";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "For individual property buyers",
    cta: "Start free",
    ctaHref: "/register",
    highlight: false,
    features: [
      "3 due diligence reports / month",
      "All 6 risk categories analyzed",
      "PDF export (with watermark)",
      "Email support (48h response)",
      "Basic risk score breakdown",
      "1 saved comparison",
    ],
    limits: [
      "No priority queue",
      "No API access",
      "No team seats",
    ],
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    tagline: "For serious buyers and independent agents",
    cta: "Upgrade to Pro",
    ctaHref: "/checkout?plan=pro",
    highlight: true,
    badge: "Most popular",
    features: [
      "Unlimited reports",
      "All exports (PDF, Excel, CSV)",
      "Priority report generation (< 15s)",
      "Priority support (12h response)",
      "Detailed risk factor explanations",
      "Unlimited saved comparisons",
      "Export history with re-download",
      "White-label PDF (no watermark)",
    ],
    limits: [],
  },
  {
    name: "Business",
    price: "₹1,999",
    period: "/month",
    tagline: "For real estate firms and brokerages",
    cta: "Start Business trial",
    ctaHref: "/checkout?plan=business",
    highlight: false,
    features: [
      "Everything in Pro",
      "5 team seats included",
      "REST API access (10k calls/mo)",
      "Custom branding on reports",
      "Bulk property upload (CSV)",
      "Advanced analytics dashboard",
      "Dedicated account manager",
      "Priority phone support",
    ],
    limits: [],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For banks, large firms, and government",
    cta: "Contact sales",
    ctaHref: "/contact?topic=enterprise",
    highlight: false,
    features: [
      "Everything in Business",
      "Unlimited team seats",
      "Unlimited API calls",
      "99.9% SLA guarantee",
      "On-premise deployment option",
      "SSO / SAML integration",
      "Custom risk scoring rules",
      "Compliance certifications (SOC2, ISO)",
      "Dedicated infrastructure",
    ],
    limits: [],
  },
];

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade whenever. Prorated billing on upgrades, credit-back on downgrades.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Free tier is genuinely free forever. Pro comes with a 14-day money-back guarantee, no questions asked.",
  },
  {
    q: "Do you offer student or NGO discounts?",
    a: "Yes — 50% off Pro for verified students, 100% off for registered NGOs. Email us with proof.",
  },
  {
    q: "How is the report count measured?",
    a: "One property analysis = one report. Regenerating an existing report doesn't count. Comparing properties uses zero reports.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, Credit/Debit cards, Net Banking via Razorpay. Enterprise plans support wire transfer.",
  },
  {
    q: "Where is my data stored?",
    a: "AWS Mumbai region (ap-south-1). Encrypted at rest with AES-256. We never sell your data. Ever.",
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-4">
            Pricing
          </div>
          <h1 className="text-[44px] md:text-[64px] leading-[1.05] font-semibold tracking-[-0.03em] mb-6">
            Fair pricing.
            <br />
            <span className="text-white/40">No hidden fees.</span>
          </h1>
          <p className="text-[17px] text-white/60 leading-relaxed">
            Start free forever. Pay only when you need more. Cancel anytime with one click —
            no calls, no forms, no guilt trips.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Note */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300 mb-3">
              🎓 STUDENT DISCOUNT
            </div>
            <p className="text-[14px] text-white/70">
              Currently studying? Get <strong className="text-white">50% off Pro</strong> forever
              with a valid .edu email or student ID. <Link href="/contact?topic=student" className="text-emerald-400 hover:underline">Apply here →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Common questions
            </div>
            <h2 className="text-[32px] md:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em]">
              Straight answers.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <FaqItem key={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[28px] md:text-[36px] font-semibold tracking-tight mb-4">
            Still deciding?
          </h2>
          <p className="text-[15px] text-white/60 mb-6">
            Start on the free tier. Upgrade only if you actually need it.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-black h-11 px-5 text-[14px] font-semibold hover:bg-white/90 transition"
          >
            Create free account →
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}

function PlanCard({ name, price, period, tagline, cta, ctaHref, highlight, badge, features, limits }) {
  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all ${
        highlight
          ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.06] to-transparent shadow-xl shadow-emerald-500/10 md:scale-[1.02]"
          : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.03]"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-6 rounded-full bg-emerald-500 text-black px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </div>
      )}
      <div className="mb-4">
        <div className="text-[13px] text-white/50 mb-1">{name}</div>
        <div className="flex items-baseline gap-1">
          <div className="text-[36px] font-bold tracking-tight">{price}</div>
          {period && <div className="text-[13px] text-white/40">{period}</div>}
        </div>
        <p className="text-[12px] text-white/50 mt-2 leading-relaxed">{tagline}</p>
      </div>
      <Link
        href={ctaHref}
        className={`block text-center rounded-lg h-10 leading-10 text-[13px] font-semibold transition mb-6 ${
          highlight
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]"
        }`}
      >
        {cta}
      </Link>
      <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-[12.5px] text-white/70">
            <svg viewBox="0 0 20 20" className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 10l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{f}</span>
          </div>
        ))}
        {limits.map((l, i) => (
          <div key={`l-${i}`} className="flex items-start gap-2 text-[12.5px] text-white/30">
            <svg viewBox="0 0 20 20" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10" strokeLinecap="round" />
            </svg>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer p-5 text-[14px] font-medium text-white hover:bg-white/[0.03] transition">
        {q}
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-white/40 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-5 pb-5 text-[13.5px] text-white/60 leading-relaxed">
        {a}
      </div>
    </details>
  );
}