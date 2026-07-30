"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { deleteAccount } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

export default function DeleteAccountModal({ isOpen, onClose, user }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isGoogleOnly = user?.authProvider === "GOOGLE";
  const passwordLabel = isGoogleOnly
    ? t("deleteAccount.emailLabel")
    : t("deleteAccount.passwordLabel");
  const passwordPlaceholder = isGoogleOnly ? user?.email : t("deleteAccount.passwordPlaceholder");

  const handleDelete = async (e) => {
    e.preventDefault();

    if (confirmation !== "DELETE") {
      toast.error(t("deleteAccount.toasts.confirmRequired"), {
        description: t("deleteAccount.toasts.typeExactly"),
      });
      return;
    }

    if (!password.trim()) {
      toast.error(
        isGoogleOnly
          ? t("deleteAccount.toasts.emailRequired")
          : t("deleteAccount.toasts.passwordRequired"),
        {
          description: isGoogleOnly
            ? t("deleteAccount.toasts.enterEmailToConfirm")
            : t("deleteAccount.toasts.enterPasswordToConfirm"),
        }
      );
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAccount({
        password: password.trim(),
        confirmation,
      });

      if (res.success) {
        toast.success(t("deleteAccount.toasts.accountDeleted"), {
          description: t("deleteAccount.toasts.redirecting"),
        });
        removeToken();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(t("deleteAccount.toasts.couldNotDelete"), {
          description: res.message || t("deleteAccount.toasts.tryAgainMoment"),
        });
      }
    } catch (err) {
      toast.error(t("deleteAccount.toasts.couldNotDelete"), {
        description: err?.message || t("deleteAccount.toasts.tryAgain"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-[#2d1214]">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("deleteAccount.title")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                {t("deleteAccount.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-700 dark:hover:text-[#e6edf3] transition"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-[#2d1214]/40 p-4">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300">
            {t("deleteAccount.impactTitle")}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-800 dark:text-red-400">
            <li>• {t("deleteAccount.impact.account")}</li>
            <li>• {t("deleteAccount.impact.properties")}</li>
            <li>• {t("deleteAccount.impact.sessions")}</li>
          </ul>
        </div>

        <form onSubmit={handleDelete} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
              {passwordLabel}
            </label>
            <input
              type={isGoogleOnly ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordPlaceholder}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 text-sm text-gray-900 dark:text-[#e6edf3] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900 disabled:bg-gray-50 dark:disabled:bg-[#1c2128] placeholder:text-gray-400 dark:placeholder:text-[#6e7681]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
              {/* "DELETE" stays Latin — used as literal confirmation string */}
              {t("deleteAccount.typeToConfirmPrefix")}{" "}
              <span className="font-mono font-black">DELETE</span>{" "}
              {t("deleteAccount.typeToConfirmSuffix")}
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              disabled={loading}
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 text-sm text-gray-900 dark:text-[#e6edf3] font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900 disabled:bg-gray-50 dark:disabled:bg-[#1c2128] placeholder:text-gray-400 dark:placeholder:text-[#6e7681]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-sm font-semibold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#30363d] disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={
                loading || confirmation !== "DELETE" || !password.trim()
              }
              className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 dark:bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("deleteAccount.deleteButton")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}