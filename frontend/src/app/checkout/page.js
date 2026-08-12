"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { Loader2, Check, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import subscriptionService from "@/services/subscriptionService";

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

  const [loading, setLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const cashfreeContainerRef = useRef(null);

  // Load Cashfree SDK once when the payment session is ready
  useEffect(() => {
    if (!checkoutReady || !paymentSessionId || !cashfreeContainerRef.current) return;

    const scriptId = "cashfree-sdk";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => {
      try {
        const cashfree = new window.Cashfree(paymentSessionId);
        const components = ["card", "upi", "netbanking", "paylater", "app"]
          .filter((c) => (window.Cashfree?.COMPONENTS ?? []).includes(c));

        cashfree.createOrderComponents({
          container: cashfreeContainerRef.current,
          components: components.length > 0 ? components : ["card", "upi", "netbanking"],
          order: { silent: false },
          onSuccess: () => {
            toast.success("Payment successful", {
              description: "Your subscription is now active.",
            });
            router.push("/dashboard/billing?success=true");
          },
          onFailure: (data) => {
            toast.error("Payment failed", {
              description: data?.paymentError?.message || data?.error?.message || "Please try again.",
            });
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Cashfree SDK init failed:", err);
        toast.error("Payment gateway failed to load", {
          description: "Refresh the page and try again.",
        });
        setLoading(false);
      }
    };
    document.body.appendChild(script);
  }, [checkoutReady, paymentSessionId, router]);

  const handleProceed = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.createOrder(plan.key);
      if (!data.success || !data.paymentSessionId) {
        throw new Error(data.message || "Could not create payment order");
      }
      setPaymentSessionId(data.paymentSessionId);
      setOrderId(data.orderId);
      setCheckoutReady(true);
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Couldn't start checkout", {
        description: err?.response?.data?.message || err.message || "Please try again.",
      });
      setLoading(false);
    }
  };

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
            {!checkoutReady ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col items-center justify-center min-h-[380px] text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
                  <Lock className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-[15px] font-medium text-white">Secure payment via Cashfree</p>
                <p className="mt-1.5 text-[13px] text-white/40 max-w-xs">
                  Cards, UPI, net banking, and wallets. No card details touch our servers.
                </p>
                <button
                  onClick={handleProceed}
                  disabled={loading}
                  className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Preparing checkout…
                    </>
                  ) : (
                    <>Proceed to payment</>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] px-5 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-white/70">Order ID</span>
                  <span className="text-[12px] font-mono text-emerald-300">{orderId}</span>
                </div>
                {/* Cashfree drop-in renders here */}
                <div ref={cashfreeContainerRef} className="cashfree-container min-h-[380px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
