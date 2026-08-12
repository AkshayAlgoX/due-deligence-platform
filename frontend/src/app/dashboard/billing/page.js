"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Zap,
  FileText,
  Calendar,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Crown,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import subscriptionService from "@/services/subscriptionService";

const PLAN_META = {
  FREE: {
    label: "Free",
    icon: FileText,
    color: "text-white/60",
    bg: "bg-white/[0.06]",
    tagline: "3 reports per month",
  },
  PRO: {
    label: "Pro",
    icon: Crown,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    tagline: "Unlimited reports, all exports",
  },
  BUSINESS: {
    label: "Business",
    icon: Building2,
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    tagline: "Teams, API access, custom branding",
  },
  ENTERPRISE: {
    label: "Enterprise",
    icon: Zap,
    color: "text-white",
    bg: "bg-white/10",
    tagline: "Custom terms, dedicated manager",
  },
};

export default function BillingPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await subscriptionService.getCurrent();
      if (result.success) setData(result);
    } catch (err) {
      console.error("Failed to load subscription:", err);
      toast.error("Couldn't load billing info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful", {
        description: "Your subscription is now active.",
      });
    }
  }, [searchParams]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const result = await subscriptionService.cancel();
      if (result.success) {
        toast.success("Subscription cancelled", {
          description: "You'll keep access until the end of the current period.",
        });
        setConfirmCancel(false);
        fetchData();
      } else {
        toast.error(result.message || "Could not cancel subscription");
      }
    } catch (err) {
      toast.error("Could not cancel subscription", {
        description: err?.response?.data?.message || err.message,
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] p-6 space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-[#161b22] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const planKey = data?.plan || "FREE";
  const meta = PLAN_META[planKey] || PLAN_META.FREE;
  const PlanIcon = meta.icon;
  const reportsRemaining = data?.reportsRemaining ?? 0;
  const reportsThisMonth = data?.reportsThisMonth ?? 0;
  const planLimit = data?.planLimit ?? 3;
  const usagePct = planLimit > 0 ? Math.min(100, Math.round((reportsThisMonth / planLimit) * 100)) : 100;

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            Billing & subscription
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
            Manage your plan, usage, and payment history.
          </p>
        </div>
        {planKey === "FREE" && (
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02]"
          >
            <ArrowUpRight size={16} /> Upgrade plan
          </Link>
        )}
      </div>

      {/* ── Current plan card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.bg}`}>
              <PlanIcon size={18} className={meta.color} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">{meta.label} plan</p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">{meta.tagline}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-[#7d8590]">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                <CheckCircle2 size={13} />
                {data?.status === "CANCELLED" ? "Cancelled (access until expiry)" : data?.status === "NONE" ? "Free" : data?.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-[#7d8590]">
                <Calendar size={13} /> Expires
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-[#e6edf3]">
                {data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Usage card ── */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6">
          <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">Reports this month</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 dark:text-[#e6edf3] tabular-nums">{reportsThisMonth}</span>
            <span className="text-sm text-gray-400 dark:text-[#7d8590]">
              / {planLimit === 2147483647 ? "∞" : planLimit} used
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-[#1c2128] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-[#7d8590]">
            {planKey === "FREE" && reportsRemaining <= 1 && reportsRemaining > 0
              ? `${reportsRemaining} report remaining this month`
              : planKey === "FREE" && reportsRemaining === 0
              ? "Monthly limit reached — upgrade for unlimited reports"
              : "Unlimited reports on your plan"}
          </p>
          {planKey === "FREE" && reportsRemaining === 0 && (
            <Link
              href="/checkout?plan=pro"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
            >
              <AlertTriangle size={13} /> Upgrade to Pro
            </Link>
          )}
        </div>

        {/* ── Actions card ── */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6">
          <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">Actions</p>
          <div className="mt-4 space-y-2.5">
            <Link
              href={planKey === "FREE" ? "/checkout?plan=pro" : "/checkout?plan=business"}
              className="flex w-full items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-sm font-bold text-white transition hover:opacity-95"
            >
              <CreditCard size={15} />
              {planKey === "FREE" ? "Upgrade to Pro" : planKey === "PRO" ? "Upgrade to Business" : "Manage plan"}
            </Link>
            {planKey !== "FREE" && (
              <button
                onClick={() => setConfirmCancel(true)}
                disabled={cancelling}
                className="flex w-full items-center justify-center gap-2 h-10 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#1c2128] text-sm font-bold text-red-600 dark:text-red-400 transition hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                {cancelling ? <Loader2 size={15} className="animate-spin" /> : "Cancel subscription"}
              </button>
            )}
          </div>
          <p className="mt-3 text-[11px] text-gray-400 dark:text-[#6e7681]">
            Cancelling keeps your access until the end of the paid period. Data is never deleted on downgrade.
          </p>
        </div>
      </div>

      {/* ── Payment history ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#30363d]">
          <h2 className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">Payment history</h2>
          <p className="text-xs text-gray-400 dark:text-[#6e7681]">Last 6 transactions</p>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-[#1c2128]">
          <div className="px-6 py-4 text-center text-sm text-gray-400 dark:text-[#7d8590]">
            No payments yet — your first subscription will appear here after checkout.
          </div>
        </div>
      </div>

      {/* ── Cancel confirmation ── */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-[#e6edf3]">Cancel subscription?</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed">
              You'll keep access until{" "}
              <span className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                {data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "the end of the period"}
              </span>
              . After that your account returns to the Free plan. Your properties, reports, and history are preserved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-[#30363d] text-sm font-bold text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition disabled:opacity-50"
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 size={14} className="animate-spin" />}
                Cancel it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
