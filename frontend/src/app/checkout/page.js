"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { Loader2, Check, ShieldCheck, Lock, ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import subscriptionService from "@/services/subscriptionService";
import { getToken } from "@/utils/helpers";

const PLANS = {
  pro: {
    name: "Pro",
    price: "₹499",
    period: "/month",
    tagline: "For serious buyers and independent agents",
    features: [
      "Unlimited reports",
      "All exports (PDF, Excel, CSV)",
      "Priority report generation (< 15s)",
      "Priority support (12h response)",
      "Detailed risk factor explanations",
      "White-label PDF (no watermark)",
    ],
  },
  business: {
    name: "Business",
    price: "₹1,999",
    period: "/month",
    tagline: "For real estate firms and brokerages",
    features: [
      "Everything in Pro",
      "5 team seats included",
      "REST API access (10k calls/mo)",
      "Custom branding on reports",
      "Bulk property upload (CSV)",
      "Dedicated account manager",
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");
  const plan = PLANS[planKey] ? { key: planKey, ...PLANS[planKey] } : { key: "pro", ...PLANS.pro };

  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Auth guard — check token before anything else ──
  useEffect(() => {
    const token = getToken();
    setAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  const handleProceed = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.createOrder(plan.key);
      if (!data.success) {
        throw new Error(data.message || "Could not create payment order");
      }
      if (data.paymentLink) {
        // Hosted checkout — full page redirect to Cashfree's secure payment page.
        // Cashfree redirects back to /checkout/success?order_id=xxx after payment.
        window.location.href = data.paymentLink;
        return;
      }
      if (data.paymentSessionId) {
        // Fallback: legacy session-based flow redirects to the same success page.
        window.location.href = `/checkout/success?order_id=${data.orderId}`;
        return;
      }
      throw new Error("Payment gateway returned no checkout link");
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Couldn't start checkout", {
        description: err?.data?.message || err?.message || "Please try again.",
      });
      setLoading(false);
    }
  };

  const goToLogin = () => {
    const redirect = encodeURIComponent(`/checkout?plan=${plan.key}`);
    router.push(`/login?redirect=${redirect}`);
  };

  // ── Loading state while checking auth ──
  if (!authChecked) {
    return (
      <MarketingLayout>
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      </MarketingLayout>
    );
  }

  // ── Not signed in — premium prompt ──
  if (!authenticated) {
    return (
      <MarketingLayout>
        <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <Lock className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sign in to continue</h1>
            <p className="mt-3 text-[14px] text-white/50 max-w-md mx-auto leading-relaxed">
              You need an account to subscribe to the{" "}
              <span className="text-white/80 font-medium">{plan.name}</span> plan
              ({plan.price}{plan.period}). Sign in or create a free account — takes 30 seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={goToLogin}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition"
              >
                <LogIn className="h-4 w-4" />
                Sign in & continue
              </button>
              <button
                onClick={() => {
                  const redirect = encodeURIComponent(`/checkout?plan=${plan.key}`);
                  router.push(`/register?redirect=${redirect}`);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] px-6 text-sm font-semibold text-white transition"
              >
                Create free account
              </button>
            </div>

            <p className="mt-6 text-[12px] text-white/30">
              After signing in, we'll bring you right back here to complete your purchase.
            </p>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  // ── Authenticated — hosted checkout flow ──
  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Plan summary ── */}
          <div className="lg:col-span-2">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Checkout</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">Confirm your plan</h1>
            <p className="mt-3 text-[14px] text-white/50">{plan.tagline}</p>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-white/40">{plan.period}</span>
                <span className="ml-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  {plan.name}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/60">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-white/40">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Secured by Cashfree · 256-bit encryption · Cancel anytime
            </div>
          </div>

          {/* ── Payment ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col items-center justify-center min-h-[380px] text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-[15px] font-medium text-white">Secure payment via Cashfree</p>
              <p className="mt-1.5 text-[13px] text-white/40 max-w-xs">
                You'll be redirected to Cashfree's hosted payment page — cards, UPI, net banking,
                and wallets. No card details ever touch our servers.
              </p>
              <button
                onClick={handleProceed}
                disabled={loading}
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparing secure checkout…
                  </>
                ) : (
                  <>Proceed to secure payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
