"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Zap,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  ArrowUpRight,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "sonner";
import subscriptionService from "@/services/subscriptionService";

const PLAN_META = {
  FREE: {
    label: "Free",
    tagline: "3 reports/month · PDF & Excel export",
    accent: "from-slate-500/20 to-slate-600/10",
    ring: "ring-slate-500/30",
    text: "text-slate-400",
    price: "₹0",
  },
  PRO: {
    label: "Pro",
    tagline: "Unlimited reports · Comparables · 11 languages",
    accent: "from-emerald-500/20 to-emerald-600/10",
    ring: "ring-emerald-500/40",
    text: "text-emerald-400",
    price: "₹499/mo",
  },
  BUSINESS: {
    label: "Business",
    tagline: "Analytics dashboard · Audit trail · SSE updates",
    accent: "from-violet-500/20 to-violet-600/10",
    ring: "ring-violet-500/40",
    text: "text-violet-400",
    price: "₹1,999/mo",
  },
  ENTERPRISE: {
    label: "Enterprise",
    tagline: "Custom deployment · Volume pricing · Priority support",
    accent: "from-amber-500/20 to-amber-600/10",
    ring: "ring-amber-500/40",
    text: "text-amber-400",
    price: "Custom",
  },
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getCurrent();
      if (!data.success) {
        setSubscription({
          plan: "FREE",
          planLimit: 3,
          reportsThisMonth: 0,
          reportsRemaining: 3,
          expiresAt: null,
          status: "NONE",
        });
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.warn("Billing fetch failed, defaulting to FREE:", err?.message);
      setSubscription({
        plan: "FREE",
        planLimit: 3,
        reportsThisMonth: 0,
        reportsRemaining: 3,
        expiresAt: null,
        status: "NONE",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showSuccess) {
      toast.success("Payment successful", {
        description: "Welcome to your new plan.",
        duration: 5000,
      });
    }
  }, [showSuccess]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const data = await subscriptionService.cancel();
      if (data.success) {
        toast.success("Subscription cancelled", { description: data.message });
        setConfirmCancel(false);
        await fetchData();
      } else {
        toast.error("Couldn't cancel", { description: data.message });
      }
    } catch (err) {
      toast.error("Cancel failed", {
        description: err?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const sub = subscription || {
    plan: "FREE",
    planLimit: 3,
    reportsThisMonth: 0,
    reportsRemaining: 3,
    expiresAt: null,
    status: "NONE",
  };

  const meta = PLAN_META[sub.plan] || PLAN_META.FREE;
  const isFree = sub.plan === "FREE";
  const isUnlimited =
    sub.planLimit < 0 ||
    sub.reportsRemaining === -1 ||
    sub.planLimit === 2147483647 ||
    !isFree;
  const isActive = sub.status === "ACTIVE";
  const isCancelled = sub.status === "CANCELLED";

  const usagePercent = isUnlimited
    ? 0
    : sub.planLimit > 0
    ? Math.min(100, (sub.reportsThisMonth / sub.planLimit) * 100)
    : 0;

  const usageColor =
    usagePercent >= 90
      ? "bg-red-500"
      : usagePercent >= 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              Billing & subscription
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
              Manage your plan, view usage, and download invoices.
            </p>
          </div>
        </div>

        {!isFree && isActive && !isCancelled && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="hidden sm:inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
          >
            Cancel subscription
          </button>
        )}
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
              Welcome to {meta.label} 🎉
            </p>
            <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mt-0.5">
              Your subscription is active. Enjoy unlimited reports and premium features.
            </p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && sub.expiresAt && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
              Subscription cancelled
            </p>
            <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mt-0.5">
              You'll keep {meta.label} access until{" "}
              {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              . After that your account moves to Free.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current plan card */}
        <div
          className={`lg:col-span-2 rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-gradient-to-br ${meta.accent} bg-white dark:bg-[#161b22] p-6 ring-1 ${meta.ring}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500 dark:text-[#7d8590]">
                Current plan
              </p>
              <div className="mt-2 flex items-baseline gap-2.5">
                <h2 className={`text-3xl font-bold ${meta.text}`}>{meta.label}</h2>
                <span className="text-sm font-medium text-gray-500 dark:text-[#7d8590]">
                  {meta.price}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-gray-600 dark:text-[#7d8590]">
                {meta.tagline}
              </p>
            </div>

            {isFree ? (
              <Link
                href="/checkout?plan=pro"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition"
              >
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            ) : (
              <div className="hidden sm:flex h-10 items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 text-[12px] font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isCancelled ? "Cancelling" : "Active"}
              </div>
            )}
          </div>

          {sub.expiresAt && !isCancelled && (
            <div className="mt-6 pt-6 border-t border-gray-200/60 dark:border-[#30363d]/60 flex items-center gap-2 text-[13px] text-gray-500 dark:text-[#7d8590]">
              <Calendar className="h-4 w-4" />
              Renews on{" "}
              <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
                {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {sub.expiresAt && isCancelled && (
            <div className="mt-6 pt-6 border-t border-gray-200/60 dark:border-[#30363d]/60 flex items-center gap-2 text-[13px] text-amber-500/80">
              <Calendar className="h-4 w-4" />
              Access ends on{" "}
              <span className="text-amber-500 font-medium">
                {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Usage card */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500 dark:text-[#7d8590]">
              Reports this month
            </p>
          </div>

          {isUnlimited ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">
                  {sub.reportsThisMonth}
                </span>
                <span className="text-sm text-gray-500 dark:text-[#7d8590] flex items-center gap-1">
                  / <InfinityIcon className="h-3.5 w-3.5" /> unlimited
                </span>
              </div>
              <p className="mt-3 text-[12px] text-emerald-500 font-medium">
                No limits on your plan
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">
                  {sub.reportsThisMonth}
                </span>
                <span className="text-sm text-gray-500 dark:text-[#7d8590]">
                  / {sub.planLimit}
                </span>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-[#30363d] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${usageColor}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>

              <p className="mt-3 text-[12px] text-gray-500 dark:text-[#7d8590]">
                {sub.reportsRemaining} remaining ·{" "}
                <Link
                  href="/checkout?plan=pro"
                  className="text-emerald-500 hover:text-emerald-400 font-medium inline-flex items-center gap-0.5"
                >
                  Get unlimited <ArrowUpRight className="h-3 w-3" />
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features included */}
      <div className="rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-4">
          What's included in {meta.label}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {getFeaturesFor(sub.plan).map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-[13px] text-gray-700 dark:text-[#e6edf3]">{f}</span>
            </div>
          ))}
        </div>

        {isFree && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#30363d]">
            <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-3">
              Ready to unlock everything?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/checkout?plan=pro"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition"
              >
                <Zap className="h-4 w-4" />
                Upgrade to Pro · ₹499/mo
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-4 text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
              >
                Compare plans
              </Link>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#30363d]">
            <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-3">
              Want to continue after your access ends?
            </p>
            <Link
              href="/checkout?plan=pro"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition"
            >
              <Zap className="h-4 w-4" />
              Resubscribe · ₹499/mo
            </Link>
          </div>
        )}
      </div>

      {/* Mobile cancel button */}
      {!isFree && isActive && !isCancelled && (
        <button
          onClick={() => setConfirmCancel(true)}
          className="sm:hidden w-full h-10 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
        >
          Cancel subscription
        </button>
      )}

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl bg-red-500/10 ring-1 ring-red-500/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <button
                onClick={() => setConfirmCancel(false)}
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1c2128] flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
              Cancel {meta.label} subscription?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed">
              You'll keep full {meta.label} access until{" "}
              <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
                {sub.expiresAt
                  ? new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "the end of your billing period"}
              </span>
              . After that, your account moves to the Free plan (3 reports/month).
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-[#30363d] text-sm font-semibold text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
              >
                Keep {meta.label}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Confirm cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFeaturesFor(plan) {
  switch (plan) {
    case "PRO":
      return [
        "Unlimited due diligence reports",
        "Unlimited saved comparisons",
        "Export history with re-download",
        "Property comparison (up to 3)",
        "Comparable properties + valuation",
        "Risk assessment history & trends",
        "Multi-language reports (11 languages)",
        "AI property assistant (chat)",
        "AI-generated report summary",
        "PDF & Excel export",
      ];
    case "BUSINESS":
      return [
        "Everything in Pro",
        "Advanced analytics dashboard",
        "Property portfolio insights",
        "Notification preferences (email + in-app)",
        "Audit trail on all actions",
        "Bulk PDF & Excel export",
        "Real-time SSE updates",
        "Extended report history",
      ];
    case "ENTERPRISE":
      return [
        "Everything in Business",
        "Custom deployment options",
        "Volume-based pricing",
        "Dedicated onboarding support",
        "Priority integration support",
        "Custom risk category weights",
        "Extended data retention",
        "Direct engineering access",
      ];
    default:
      return [
        "3 due diligence reports per month",
        "All 6 risk categories analyzed",
        "PDF & Excel export",
        "AI property assistant (chat)",
        "AI-generated report summary",
        "1 saved property comparison",
        "Fraud alert badges",
        "Email support",
      ];
  }
}