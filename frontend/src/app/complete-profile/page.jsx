"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
    labelKey: "completeProfile.roles.buyer.label",
    descriptionKey: "completeProfile.roles.buyer.description",
    icon: UserIcon,
    color: "green",
  },
  {
    value: "REAL_ESTATE_AGENT",
    labelKey: "completeProfile.roles.agent.label",
    descriptionKey: "completeProfile.roles.agent.description",
    icon: Building2,
    color: "blue",
  },
  {
    value: "LEGAL_REVIEWER",
    labelKey: "completeProfile.roles.legal.label",
    descriptionKey: "completeProfile.roles.legal.description",
    icon: Scale,
    color: "purple",
  },
  {
    value: "FINANCIAL_INSTITUTION",
    labelKey: "completeProfile.roles.financial.label",
    descriptionKey: "completeProfile.roles.financial.description",
    icon: Landmark,
    color: "orange",
  },
];

const COLOR_CLASSES = {
  green: {
    ring: "ring-green-500 dark:ring-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-500/40",
  },
  blue: {
    ring: "ring-blue-500 dark:ring-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/40",
  },
  purple: {
    ring: "ring-purple-500 dark:ring-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-500/40",
  },
  orange: {
    ring: "ring-orange-500 dark:ring-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/40",
  },
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("googleSignupData");
    if (!data) {
      toast.error(t("completeProfile.toasts.sessionExpired.title"), {
        description: t("completeProfile.toasts.sessionExpired.description"),
      });
      router.push("/login");
      return;
    }
    setGoogleData(JSON.parse(data));
  }, [router, t]);

  const handleCloseAndSignOut = () => {
    const confirmed = window.confirm(t("completeProfile.confirmSignOut"));
    if (!confirmed) return;

    removeToken();
    try {
      sessionStorage.removeItem("googleSignupData");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch {
      // silently ignore
    }

    toast.info(t("completeProfile.toasts.signedOut.title"), {
      description: t("completeProfile.toasts.signedOut.description"),
    });
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error(t("completeProfile.toasts.roleRequired.title"), {
        description: t("completeProfile.toasts.roleRequired.description"),
      });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      toast.error(t("completeProfile.toasts.invalidPhone.title"), {
        description: t("completeProfile.toasts.invalidPhone.description"),
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

      const firstName = googleData.name?.split(" ")[0] || t("completeProfile.defaultName");
      toast.success(t("completeProfile.toasts.welcome.title", { name: firstName }), {
        description: t("completeProfile.toasts.welcome.description"),
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err) {
      toast.error(t("completeProfile.toasts.signupFailed.title"), {
        description: err.message || t("completeProfile.toasts.signupFailed.description"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!googleData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8FB] dark:bg-[#0d1117]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf7f3] via-white to-[#f8fffb] dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117] px-4 py-8">
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

        {/* Card */}
        <div className="relative rounded-3xl bg-white dark:bg-[#161b22] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-[#30363d]">

          {/* X close */}
          <button
            type="button"
            onClick={handleCloseAndSignOut}
            disabled={loading}
            aria-label={t("completeProfile.signOutAria")}
            title={t("completeProfile.signOutTitle")}
            className="
              absolute right-4 top-4 z-10
              flex h-9 w-9 items-center justify-center
              rounded-xl
              border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128]
              text-gray-400 dark:text-[#6e7681]
              transition
              hover:border-red-200 hover:bg-red-50 hover:text-red-600
              dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400
              hover:shadow-sm
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>

          {/* Google user banner */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 p-4 ring-1 ring-green-100 dark:ring-green-500/30 pr-14">
            {googleData.picture ? (
              <img
                src={googleData.picture}
                alt={googleData.name}
                className="h-14 w-14 rounded-full ring-2 ring-white dark:ring-[#161b22] shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-lg font-black text-white ring-2 ring-white dark:ring-[#161b22]">
                {(googleData.name || googleData.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] truncate">
                {t("completeProfile.signedInAs", { name: googleData.name })}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590] truncate">
                {googleData.email}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-full bg-white dark:bg-[#161b22] px-2.5 py-1 ring-1 ring-green-200 dark:ring-green-500/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-green-700 dark:text-green-400">
                ✓ Google
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {t("completeProfile.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("completeProfile.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#7d8590]">
                {t("completeProfile.roleLabel")}
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
                          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} ring-offset-2 dark:ring-offset-[#161b22]`
                          : "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#22272e]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isSelected
                            ? colors.bg
                            : "bg-gray-100 dark:bg-[#22272e] group-hover:bg-gray-200 dark:group-hover:bg-[#30363d]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isSelected ? colors.text : "text-gray-500 dark:text-[#7d8590]"}`}
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? "text-gray-900 dark:text-[#e6edf3]" : "text-gray-700 dark:text-[#e6edf3]"}`}>
                          {t(role.labelKey)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#7d8590]">
                          {t(role.descriptionKey)}
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#7d8590]">
                {t("completeProfile.phoneLabel")}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-gray-500 dark:text-[#7d8590]">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-semibold">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t("completeProfile.phonePlaceholder")}
                  disabled={loading}
                  maxLength={10}
                  className="h-12 w-full rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-900 dark:text-[#e6edf3] pl-20 pr-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/20 disabled:bg-gray-50 dark:disabled:bg-[#161b22]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500 dark:text-[#7d8590]">
                {t("completeProfile.phoneHelp")}
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
                  {t("completeProfile.creating")}
                </>
              ) : (
                <>
                  {t("completeProfile.submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-500 dark:text-[#7d8590]">
              {t("completeProfile.terms")}
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-[#7d8590]">
          {t("completeProfile.notYou")}{" "}
          <button
            type="button"
            onClick={handleCloseAndSignOut}
            disabled={loading}
            className="font-semibold text-gray-700 dark:text-[#e6edf3] hover:text-red-600 dark:hover:text-red-400 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {t("completeProfile.signOut")}
          </button>
        </p>
      </div>
    </main>
  );
}