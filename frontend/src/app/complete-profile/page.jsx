"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  Phone,
  ArrowRight,
  Loader2,
  User as UserIcon,
  Building2,
  Scale,
  Landmark,
  X,
} from "lucide-react";

import { completeGoogleSignup } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

const ROLES = [
  {
    value: "BUYER",
    label: "Buyer / Individual",
    description: "Looking to purchase properties",
    icon: UserIcon,
    color: "green",
  },
  {
    value: "REAL_ESTATE_AGENT",
    label: "Real Estate Agent",
    description: "Managing property listings",
    icon: Building2,
    color: "blue",
  },
  {
    value: "LEGAL_REVIEWER",
    label: "Legal Reviewer",
    description: "Reviewing legal documents",
    icon: Scale,
    color: "purple",
  },
  {
    value: "FINANCIAL_INSTITUTION",
    label: "Financial Institution",
    description: "Bank / Lending partner",
    icon: Landmark,
    color: "orange",
  },
];

const COLOR_CLASSES = {
  green:  { ring: "ring-green-500",  bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200" },
  blue:   { ring: "ring-blue-500",   bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200" },
  purple: { ring: "ring-purple-500", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  orange: { ring: "ring-orange-500", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Google data from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem("googleSignupData");
    if (!data) {
      toast.error("Session expired", {
  description: "Please sign in again to continue.",
});
      router.push("/login");
      return;
    }
    setGoogleData(JSON.parse(data));
  }, [router]);

  // ── X button: sign out + go home ─────────────────────────────────────
  const handleCloseAndSignOut = () => {
    const confirmed = window.confirm(
      "Sign out and go back? Your progress will be lost."
    );
    if (!confirmed) return;

    // Clean up any partial auth state
    removeToken();
    try {
      sessionStorage.removeItem("googleSignupData");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch {
      // silently ignore
    }

    toast.info("You're signed out", {
  description: "Sign in again anytime.",
});
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Role required", {
  description: "Please pick a role to continue.",
});
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      toast.error("Invalid phone number", {
  description: "Enter a 10-digit Indian mobile starting with 6-9.",
});
      return;
    }

    setLoading(true);
    try {
      await completeGoogleSignup({
        credential: googleData.credential,
        role: selectedRole,
        phoneNumber,
      });

      sessionStorage.removeItem("googleSignupData");

      const firstName = googleData.name?.split(" ")[0] || "there";
      toast.success(`Welcome to the platform, ${firstName}`, {
        description: "Your account is ready. Redirecting to your dashboard.",
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err) {
      toast.error("Signup couldn't be completed", {
  description: err.message || "Please try again in a moment.",
});
    } finally {
      setLoading(false);
    }
  };

  if (!googleData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf7f3] via-white to-[#f8fffb] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/30">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[18px] font-black tracking-tight bg-gradient-to-r from-[#22C55E] to-[#16a34a] bg-clip-text text-transparent">
            Real Estate Due Diligence
          </h1>
        </div>

        {/* Card — with X close button ─────────────────────────────────── */}
        <div className="relative rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5">

          {/* ── X CLOSE BUTTON (top-right) ────────────────────────── */}
          <button
            type="button"
            onClick={handleCloseAndSignOut}
            disabled={loading}
            aria-label="Sign out and close"
            title="Sign out"
            className="
              absolute right-4 top-4 z-10
              flex h-9 w-9 items-center justify-center
              rounded-xl
              border border-gray-200 bg-white
              text-gray-400
              transition
              hover:border-red-200 hover:bg-red-50 hover:text-red-600
              hover:shadow-sm
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>

          {/* Google user info banner */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 ring-1 ring-green-100 pr-14">
            {googleData.picture ? (
              <img
                src={googleData.picture}
                alt={googleData.name}
                className="h-14 w-14 rounded-full ring-2 ring-white shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-lg font-black text-white ring-2 ring-white">
                {(googleData.name || googleData.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                Signed in as {googleData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {googleData.email}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 ring-1 ring-green-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-green-700">
                ✓ Google
              </span>
            </div>
          </div>

          {/* Header — no emoji, cleaner ────────────────────────────── */}
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              One more step
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Tell us a bit about yourself to personalize your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const colors = COLOR_CLASSES[role.color];
                  const isSelected = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      disabled={loading}
                      className={`group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} ring-offset-2`
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isSelected ? colors.bg : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isSelected ? colors.text : "text-gray-500"}`}
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                          {role.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {role.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full ${colors.bg} ring-1 ${colors.border}`}>
                          <span className={`text-xs font-black ${colors.text}`}>✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-semibold">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  disabled={loading}
                  maxLength={10}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-20 pr-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500">
                We&apos;ll use this for important account notifications only.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !selectedRole || phoneNumber.length !== 10}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(34,197,94,0.5)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your account…
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-500">
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </form>
        </div>

        {/* ── Alternative sign-out link at bottom ──────────────────── */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Not you?{" "}
          <button
            type="button"
            onClick={handleCloseAndSignOut}
            disabled={loading}
            className="font-semibold text-gray-700 hover:text-red-600 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            Sign out
          </button>
        </p>
      </div>
    </main>
  );
}