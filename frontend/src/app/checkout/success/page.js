"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { CheckCircle2, Loader2, LayoutDashboard, CreditCard, FileText, Mail, RefreshCw } from "lucide-react";
import subscriptionService from "@/services/subscriptionService";
import { getUser } from "@/utils/helpers";

const PLAN_LABELS = {
  PRO: "Pro",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
  UNKNOWN: "Pro",
};

const PLAN_PRICES = {
  PRO: 49900,
  BUSINESS: 199900,
  ENTERPRISE: 0,
  UNKNOWN: 49900,
};

const MAX_ATTEMPTS = 8;   // 8 × 2s = 16s of polling before we show the "processing" state

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [phase, setPhase] = useState("verifying"); // verifying | paid | pending | notcompleted
  const [result, setResult] = useState(null);
  const [cashfreeStatus, setCashfreeStatus] = useState(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef(null);

  const user = typeof window !== "undefined" ? getUser() : null;
  const userEmail = user?.email || "your email";

  const verify = useCallback(async () => {
    if (!orderId) {
      setPhase("notcompleted");
      return;
    }
    try {
      const data = await subscriptionService.verifyOrder(orderId);
      if (data?.status === "PAID") {
        setResult(data);
        setPhase("paid");
        return;
      }
      // Track the raw Cashfree status for smarter messaging
      setCashfreeStatus(data?.cashfreeStatus || null);
      // "ACTIVE" means the order was created but payment was never
      // completed on the hosted page — no point polling further.
      if (data?.cashfreeStatus === "ACTIVE" || data?.cashfreeStatus === "EXPIRED") {
        setPhase("notcompleted");
        return;
      }
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setPhase("pending");
        return;
      }
      timerRef.current = setTimeout(verify, 2000);
    } catch (err) {
      console.warn("verify-order attempt failed:", err?.message);
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setPhase("pending");
        return;
      }
      timerRef.current = setTimeout(verify, 2000);
    }
  }, [orderId]);

  useEffect(() => {
    verify();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [verify]);

  const plan = result?.plan || "UNKNOWN";
  const planLabel = PLAN_LABELS[plan] || plan;
  const amountPaise = result?.amount || PLAN_PRICES[plan] || 0;
  const amountFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);

  const expiresAt = result?.expiresAt ? new Date(result.expiresAt) : null;
  const renewsOn = expiresAt
    ? expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "next month";

  return (
    <MarketingLayout>
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
        {phase === "verifying" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white">Confirming your payment…</h1>
            <p className="mt-2 text-[14px] text-white/50">
              We're checking with Cashfree. This usually takes a few seconds.
            </p>
          </div>
        )}

        {phase === "paid" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-12 flex flex-col items-center text-center">
            {/* Confetti-style success animation */}
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" strokeWidth={2} />
              </div>
              {["-left-6 top-0", "left-0 -top-4", "-right-6 top-2", "right-0 -top-2", "-left-4 bottom-2"].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos} h-2 w-2 rounded-full bg-emerald-400/80 animate-ping`}
                  style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.4s" }}
                />
              ))}
            </div>

            <h1 className="text-3xl font-bold text-white">Welcome to {planLabel} 🎉</h1>
            <p className="mt-3 text-[15px] text-white/60 max-w-md leading-relaxed">
              Your payment of <span className="text-white font-semibold">{amountFormatted}</span> was
              successful. Your subscription is now active.
            </p>

            <div className="mt-8 w-full max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.05] text-left">
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13px] text-white/50">Plan</span>
                <span className="text-[13px] font-semibold text-emerald-400">{planLabel}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13px] text-white/50">Amount paid</span>
                <span className="text-[13px] font-semibold text-white">{amountFormatted}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13px] text-white/50">Renews on</span>
                <span className="text-[13px] font-semibold text-white">{renewsOn}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
              <Link
                href="/dashboard"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
              <Link
                href="/dashboard/billing"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] px-6 text-sm font-semibold text-white transition"
              >
                <CreditCard className="h-4 w-4" /> View Billing
              </Link>
              <Link
                href="/dashboard/property-search"
                className="w-full inline-flex h-11 items-center justify-center gap-2 text-sm font-medium text-white/60 hover:text-white transition"
              >
                <FileText className="h-4 w-4" /> Generate first report
              </Link>
            </div>
          </div>
        )}

        {phase === "pending" && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-12 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-5">
              <Mail className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment is still processing</h1>
            <p className="mt-3 text-[14px] text-white/50 max-w-md leading-relaxed">
              Cashfree is taking a little longer than usual to confirm your payment. Don't worry —
              you haven't been charged twice, and we'll email{" "}
              <span className="text-white/80">{userEmail}</span> the moment it's confirmed.
            </p>
            <p className="mt-2 text-[13px] text-white/40">
              Check your billing page in a few minutes — it updates automatically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
              <Link
                href="/dashboard/billing"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-6 text-sm font-semibold text-[#0a0a0a] transition"
              >
                <CreditCard className="h-4 w-4" /> Check billing page
              </Link>
              <Link
                href="/dashboard"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] px-6 text-sm font-semibold text-white transition"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {phase === "notcompleted" && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-12 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-5">
              <RefreshCw className="h-7 w-7 text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment wasn't completed</h1>
            <p className="mt-3 text-[14px] text-white/50 max-w-md leading-relaxed">
              Cashfree shows this order as{" "}
              <span className="text-white/80 font-mono text-[13px]">{cashfreeStatus || "ACTIVE"}</span>{" "}
              — no payment went through, and you haven't been charged.
            </p>
            <p className="mt-2 text-[13px] text-white/40">
              It's safe to try again with the same card — each attempt creates a fresh order.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
              <Link
                href="/checkout?plan=pro"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition"
              >
                <RefreshCw className="h-4 w-4" /> Try payment again
              </Link>
              <Link
                href="/dashboard"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] px-6 text-sm font-semibold text-white transition"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </MarketingLayout>
  );
}
