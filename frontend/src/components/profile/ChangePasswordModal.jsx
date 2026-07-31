"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePassword } from "@/services/authService";
import { getPasswordStrength } from "@/utils/helpers";

// Returns translation KEYS (rendered via t() at usage site).
function validateField(field, value) {
  const trimmed = String(value ?? "").trim();
  switch (field) {
    case "currentPassword":
      if (!trimmed) return "changePassword.errors.currentRequired";
      return "";
    case "newPassword":
      if (!trimmed) return "changePassword.errors.newRequired";
      if (trimmed.length < 8) return "auth.errors.passwordLength";
      if (!/[A-Za-z]/.test(trimmed)) return "auth.errors.passwordLetter";
      if (!/\d/.test(trimmed)) return "auth.errors.passwordNumber";
      return "";
    default:
      return "";
  }
}

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    !loading;

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowCurrent(false);
    setShowNew(false);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    if (newPassword === currentPassword) {
      toast.error(t("changePassword.toasts.samePassword"), {
        description: t("changePassword.toasts.samePasswordDesc"),
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success(t("changePassword.toasts.success"), {
        description: t("changePassword.toasts.successDesc"),
      });
      reset();
      onClose();
    } catch (err) {
      toast.error(t("changePassword.toasts.failed"), {
        description: err?.message || t("common.retry"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/70 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f3] dark:bg-[#0d2818]">
              <Lock className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("changePassword.title")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                {t("changePassword.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 dark:text-[#7d8590] hover:text-gray-600 dark:hover:text-[#e6edf3] disabled:opacity-50"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("changePassword.currentLabel")}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, currentPassword: validateField("currentPassword", e.target.value) }));
                }}
                autoFocus
                className={`w-full rounded-lg border bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 dark:placeholder:text-[#6e7681] ${
                  errors.currentPassword
                    ? "border-red-300 dark:border-red-900 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900"
                    : "border-gray-200 dark:border-[#30363d] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                }`}
                placeholder={t("changePassword.currentPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7d8590] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                aria-label={showCurrent ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {t(errors.currentPassword)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("changePassword.newLabel")}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: validateField("newPassword", e.target.value) }));
                }}
                className={`w-full rounded-lg border bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 dark:placeholder:text-[#6e7681] ${
                  errors.newPassword
                    ? "border-red-300 dark:border-red-900 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900"
                    : "border-gray-200 dark:border-[#30363d] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                }`}
                placeholder={t("changePassword.newPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7d8590] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                aria-label={showNew ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {t(errors.newPassword)}
              </p>
            )}

            {newPassword && (
  <div className="mt-2">
    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#1c2128]">
      <div
        className={`h-full transition-all ${strength.color} ${strength.width}`}
      />
    </div>
    <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">
      {strength.labelKey ? t(strength.labelKey) : ""}
    </p>
  </div>
)}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("changePassword.confirmLabel")}
            </label>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] px-3 py-2.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 placeholder:text-gray-400 dark:placeholder:text-[#6e7681]"
              placeholder={t("changePassword.confirmPlaceholder")}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                {t("auth.register.errors.passwordsMismatch")}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#30363d] disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t("changePassword.saving") : t("changePassword.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}