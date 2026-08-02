"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const RESEND_COOLDOWN_DEFAULT = 60;
const OTP_LENGTH = 6;

/**
 * OtpVerificationModal
 *
 * Overlays the register form after the user submits.
 * User enters the 6-digit OTP → we verify → real account is created → auto-login.
 *
 * Rendered via React Portal into document.body so it escapes any parent
 * stacking contexts (backdrop-filter, transform, etc.) and always sits on top.
 *
 * Props:
 *   isOpen                bool
 *   email                 string    — the email the OTP was sent to
 *   maskedEmail           string    — pre-masked from backend (e.g. "j***@gmail.com")
 *   fullName              string    — used locally for saveUser cache after verify
 *   role                  string    — used locally for saveUser cache after verify
 *   initialCooldown       number    — seconds until resend is allowed (from server)
 *   onVerify              async (otp) => void     — MUST throw on failure with .message
 *   onResend              async () => { resendCooldownSeconds, maskedEmail }  — MUST throw on failure
 *   onChangeEmail         () => void  — closes modal and returns to form
 *   onSuccess             () => void  — called after verify resolves; parent redirects
 */
export default function OtpVerificationModal({
  isOpen,
  email,
  maskedEmail,
  fullName,
  role,
  initialCooldown = RESEND_COOLDOWN_DEFAULT,
  onVerify,
  onResend,
  onChangeEmail,
  onSuccess,
}) {
  const { t } = useTranslation();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [resendIn, setResendIn] = useState(initialCooldown);
  const [mounted, setMounted] = useState(false);

  const inputRefs = useRef([]);

  // Mark mounted on client — prevents SSR mismatch with portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      setSucceeded(false);
      setResendIn(initialCooldown);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, initialCooldown]);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen || resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [isOpen, resendIn]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (error) setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const code = otp.join("");
      if (code.length === OTP_LENGTH) handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    if (error) setError("");
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === OTP_LENGTH) {
      // Auto-verify on full paste after a beat
      setTimeout(() => handleVerify(pasted), 150);
    }
  };

  const handleVerify = async (overrideCode) => {
    const code = overrideCode || otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError(t("otpVerification.errors.enterAllDigits"));
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await onVerify(code);
      setSucceeded(true);
      toast.success(t("otpVerification.toasts.verifiedTitle"), {
        description: t("otpVerification.toasts.verifiedDesc"),
      });
      setTimeout(() => onSuccess?.(), 600);
    } catch (err) {
      const msg = err?.message || t("otpVerification.errors.invalidCode");
      setError(msg);
      setShakeKey((k) => k + 1);
      // Clear all boxes on failure and refocus first
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
      toast.error(t("otpVerification.toasts.verifyFailed"), {
        description: msg,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const data = await onResend();
      setResendIn(data?.resendCooldownSeconds ?? RESEND_COOLDOWN_DEFAULT);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      toast.success(t("otpVerification.toasts.resentTitle"), {
        description: t("otpVerification.toasts.resentDesc"),
      });
    } catch (err) {
      toast.error(t("otpVerification.toasts.resendFailed"), {
        description: err?.message || t("otpVerification.errors.tryAgainMoment"),
      });
    } finally {
      setResending(false);
    }
  };

  const isBusy = verifying || succeeded;
  const codeFull = otp.every((d) => d !== "");

  // Don't render on server or before mount
  if (!mounted) return null;
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="otp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/80 dark:bg-black/85 p-4 backdrop-blur-md"
      >
        <motion.div
          key="otp-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#161b22] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:ring-[#30363d]"
        >
          {/* ── Change email button (top-right) ── */}
          <button
            type="button"
            onClick={onChangeEmail}
            disabled={isBusy}
            aria-label={t("otpVerification.close")}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-400 dark:text-[#6e7681] transition hover:border-gray-300 dark:hover:border-[#484f58] hover:text-gray-700 dark:hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>

          {/* ── Header ── */}
          <div className="mb-6 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: "backOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50"
            >
              {succeeded ? (
                <CheckCircle2 className="h-6 w-6 text-[#16a34a]" strokeWidth={2.2} />
              ) : (
                <Mail className="h-6 w-6 text-[#16a34a]" strokeWidth={2} />
              )}
            </motion.div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {succeeded
                ? t("otpVerification.successTitle")
                : t("otpVerification.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
              {succeeded
                ? t("otpVerification.successSubtitle")
                : t("otpVerification.subtitle")}{" "}
              {!succeeded && (
                <span className="font-semibold text-gray-800 dark:text-[#e6edf3]">
                  {maskedEmail || email}
                </span>
              )}
            </p>
          </div>

          {/* ── OTP inputs — hidden when success ── */}
          {!succeeded && (
            <>
              <motion.div
                key={shakeKey}
                animate={
                  shakeKey > 0
                    ? { x: [0, -8, 8, -8, 8, -4, 4, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
                className="flex justify-center gap-2"
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isBusy}
                    aria-label={t("otpVerification.digitAria", { n: i + 1 })}
                    className={`h-12 w-11 rounded-xl border-2 bg-white dark:bg-[#0d1117] text-center text-lg font-black text-gray-900 dark:text-[#e6edf3] outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-[#1c2128] ${
                      error
                        ? "border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-[#30363d] focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30"
                    }`}
                  />
                ))}
              </motion.div>

              {error && (
                <p
                  role="alert"
                  className="mt-3 text-center text-[12px] leading-tight text-red-500 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={!codeFull || isBusy}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:scale-[1.01] hover:bg-[#16a34a] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("otpVerification.verifying")}
                  </>
                ) : (
                  <>
                    {t("otpVerification.verifyAndCreate")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* ── Resend + change email ── */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={onChangeEmail}
                  disabled={isBusy}
                  className="font-semibold text-gray-500 dark:text-[#7d8590] transition hover:text-gray-800 dark:hover:text-[#e6edf3] disabled:opacity-50"
                >
                  {t("otpVerification.changeEmail")}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendIn > 0 || resending || isBusy}
                  className="font-semibold text-[#22C55E] transition hover:text-[#16a34a] disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-[#6e7681]"
                >
                  {resending
                    ? t("otpVerification.resending")
                    : resendIn > 0
                    ? t("otpVerification.resendIn", { n: resendIn })
                    : t("otpVerification.resendCode")}
                </button>
              </div>

              <p className="mt-5 text-center text-[11px] text-gray-400 dark:text-[#6e7681]">
                {t("otpVerification.securityNote")}
              </p>
            </>
          )}

          {succeeded && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#22C55E]" />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}