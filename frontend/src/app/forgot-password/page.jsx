"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  KeyRound,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Inbox,
} from "lucide-react";

import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "@/services/authService";

const STEPS = {
  EMAIL:    1,
  OTP:      2,
  PASSWORD: 3,
  SUCCESS:  4,
};

const RESEND_COOLDOWN = 45;
const COOLDOWN_KEY = "fp_resend_cooldown_until";
const SUCCESS_REDIRECT_SECONDS = 5;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [redirectIn, setRedirectIn] = useState(SUCCESS_REDIRECT_SECONDS);

  const emailRef = useRef(null);
  const otpRefs = useRef([]);
  const passwordRef = useRef(null);

  useEffect(() => {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    if (remaining > 0) setResendIn(remaining);
  }, []);

  useEffect(() => {
    if (resendIn <= 0) { localStorage.removeItem(COOLDOWN_KEY); return; }
    const t = setInterval(() => {
      setResendIn((s) => {
        const next = s - 1;
        if (next <= 0) localStorage.removeItem(COOLDOWN_KEY);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === STEPS.EMAIL)    emailRef.current?.focus();
    if (step === STEPS.OTP)      otpRefs.current[0]?.focus();
    if (step === STEPS.PASSWORD) passwordRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== STEPS.SUCCESS) return;
    setRedirectIn(SUCCESS_REDIRECT_SECONDS);
    const interval = setInterval(() => {
      setRedirectIn((s) => Math.max(0, s - 1));
    }, 1000);
    const timer = setTimeout(() => { router.push("/login"); }, SUCCESS_REDIRECT_SECONDS * 1000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [step, router]);

  const startCooldown = () => {
    const until = Date.now() + RESEND_COOLDOWN * 1000;
    localStorage.setItem(COOLDOWN_KEY, String(until));
    setResendIn(RESEND_COOLDOWN);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setFieldErrors({ email: "Enter your email" }); emailRef.current?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldErrors({ email: "Enter a valid email address" }); emailRef.current?.focus(); return;
    }
    if (resendIn > 0) {
      toast.error("Please wait", { description: `You can request a new code in ${resendIn}s.` }); return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await forgotPassword(trimmed);
      toast.success("Code sent", { description: "Check your inbox for the 6-digit code." });
      startCooldown();
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error("Could not send code", { description: err?.message || "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      toast.success("New code sent");
      startCooldown();
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Could not resend", { description: err?.message || "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setFieldErrors({ otp: "Enter the 6-digit code" }); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await verifyResetOtp({ email, otp: code });
      setStep(STEPS.PASSWORD);
    } catch (err) {
      setFieldErrors({ otp: err?.message || "Invalid or expired code" });
      toast.error("Verification failed", { description: err?.message || "Please check the code and try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newPassword) errors.newPassword = "Enter a new password";
    else if (newPassword.length < 8) errors.newPassword = "At least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword))
      errors.newPassword = "Include uppercase, lowercase, and a number";
    if (!confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await resetPassword({ email, otp: otp.join(""), newPassword });
      localStorage.removeItem(COOLDOWN_KEY);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      toast.error("Could not reset password", { description: err?.message || "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (fieldErrors.otp) setFieldErrors({});
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft"  && index > 0)               otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)               otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    if (pasted.length === 6) otpRefs.current[5]?.focus();
    else otpRefs.current[pasted.length]?.focus();
  };

  const handlePasswordKey = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const onEmailChange        = (e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({}); };
  const onNewPasswordChange   = (e) => { setNewPassword(e.target.value);    if (fieldErrors.newPassword)    setFieldErrors((p) => ({ ...p, newPassword: "" })); };
  const onConfirmPasswordChange = (e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" })); };

  const maskedEmail = email
    ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_, first, mid, domain) =>
        `${first}${"•".repeat(Math.min(mid.length, 4))}${domain}`
      )
    : "";

  // Shared input class builder
  const inputCls = (hasError) =>
    `h-11 w-full rounded-xl border bg-white dark:bg-[#0d1117] pl-10 pr-3 text-sm text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-400 dark:placeholder:text-[#6e7681] outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-[#1c2128] ${
      hasError
        ? "border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
        : "border-gray-200 dark:border-[#30363d] focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30"
    }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#edf7f3] via-white to-[#f8fffb] dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117] px-4 py-8">
      <div className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-[#22C55E]">
            Real Estate Due Diligence Agent
          </h1>
        </div>

        {/* ── Progress dots ── */}
        {step !== STEPS.SUCCESS && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step
                    ? "w-8 bg-[#22C55E]"
                    : s < step
                    ? "w-6 bg-green-300 dark:bg-green-700"
                    : "w-6 bg-gray-200 dark:bg-[#30363d]"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Card ── */}
        <div className="rounded-3xl bg-white dark:bg-[#161b22] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ring-1 ring-black/5 dark:ring-[#30363d]">

          {/* ── STEP 1 — Email ── */}
          {step === STEPS.EMAIL && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
                  <KeyRound className="h-6 w-6 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
                  Enter your email and we'll send a 6-digit code.
                </p>
              </div>

              <form onSubmit={handleSendCode} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="fp-email" className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]" />
                    <input
                      ref={emailRef}
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={onEmailChange}
                      placeholder="name@company.com"
                      disabled={loading}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? "fp-email-error" : undefined}
                      className={inputCls(fieldErrors.email)}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="fp-email-error" role="alert" className="pl-1 text-[11px] leading-tight text-red-500 dark:text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || resendIn > 0}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                    loading || resendIn > 0
                      ? "bg-gray-200 dark:bg-[#1c2128] text-gray-500 dark:text-[#6e7681] cursor-not-allowed"
                      : "bg-[#22C55E] text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] hover:scale-[1.01] hover:bg-[#16a34a]"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : resendIn > 0 ? (
                    <>Wait {resendIn}s before resending</>
                  ) : (
                    <>Send code <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                {resendIn > 0 && (
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                      A code was already sent. Check your inbox first.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!email.trim()) {
                          setFieldErrors({ email: "Enter the email you used" });
                          emailRef.current?.focus();
                          return;
                        }
                        setFieldErrors({});
                        setStep(STEPS.OTP);
                      }}
                      className="text-xs font-semibold text-[#22C55E] transition hover:text-[#16a34a] hover:underline"
                    >
                      I already have a code
                    </button>
                  </div>
                )}
              </form>
            </>
          )}

          {/* ── STEP 2 — OTP ── */}
          {step === STEPS.OTP && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
                  <Inbox className="h-6 w-6 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                  Enter the code
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
                  Sent to{" "}
                  <span className="font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {maskedEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      aria-label={`Digit ${i + 1}`}
                      className={`h-12 w-11 rounded-xl border-2 bg-white dark:bg-[#0d1117] text-center text-lg font-black text-gray-900 dark:text-[#e6edf3] outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-[#1c2128] ${
                        fieldErrors.otp
                          ? "border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-[#30363d] focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30"
                      }`}
                    />
                  ))}
                </div>

                {fieldErrors.otp && (
                  <p role="alert" className="text-center text-[11px] leading-tight text-red-500 dark:text-red-400">
                    {fieldErrors.otp}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:scale-[1.01] hover:bg-[#16a34a] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Verify code <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep(STEPS.EMAIL); setOtp(["", "", "", "", "", ""]); setFieldErrors({}); }}
                    className="font-semibold text-gray-500 dark:text-[#7d8590] transition hover:text-gray-800 dark:hover:text-[#e6edf3]"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendIn > 0 || loading}
                    className="font-semibold text-[#22C55E] transition hover:text-[#16a34a] disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-[#6e7681]"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3 — New password ── */}
          {step === STEPS.PASSWORD && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900/50">
                  <Lock className="h-6 w-6 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                  Set a new password
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
                  Use at least 8 characters with a mix of cases and a number.
                </p>
              </div>

              <form onSubmit={handleResetPassword} noValidate className="space-y-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <label htmlFor="fp-new" className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]" />
                    <input
                      ref={passwordRef}
                      id="fp-new"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={onNewPasswordChange}
                      onKeyDown={handlePasswordKey}
                      onKeyUp={handlePasswordKey}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="At least 8 characters"
                      disabled={loading}
                      aria-invalid={!!fieldErrors.newPassword}
                      className={`${inputCls(fieldErrors.newPassword)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {capsLockOn && passwordFocused && !fieldErrors.newPassword && (
                    <p className="flex items-center gap-1 pl-1 text-[11px] leading-tight text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                      Caps Lock is on
                    </p>
                  )}
                  {fieldErrors.newPassword && (
                    <p role="alert" className="pl-1 text-[11px] leading-tight text-red-500 dark:text-red-400">
                      {fieldErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label htmlFor="fp-confirm" className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]" />
                    <input
                      id="fp-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={onConfirmPasswordChange}
                      placeholder="Re-enter password"
                      disabled={loading}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      className={`${inputCls(fieldErrors.confirmPassword)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p role="alert" className="pl-1 text-[11px] leading-tight text-red-500 dark:text-red-400">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Requirements checklist */}
                <div className="space-y-1.5 rounded-xl bg-gray-50 dark:bg-[#1c2128] p-3">
                  <Requirement met={newPassword.length >= 8}>
                    At least 8 characters
                  </Requirement>
                  <Requirement met={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)}>
                    Upper and lower case
                  </Requirement>
                  <Requirement met={/\d/.test(newPassword)}>
                    Contains a number
                  </Requirement>
                  <Requirement met={newPassword.length > 0 && newPassword === confirmPassword}>
                    Passwords match
                  </Requirement>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:scale-[1.01] hover:bg-[#16a34a] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Reset password <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 4 — Success ── */}
          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-3xl bg-green-400/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/40 ring-4 ring-white dark:ring-[#161b22]">
                  <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                Password updated
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
                Sign in with your new password to continue.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:scale-[1.01] hover:bg-[#16a34a]"
              >
                Back to sign in
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-xs text-gray-400 dark:text-[#6e7681]">
                Redirecting in {redirectIn}s…
              </p>
            </div>
          )}
        </div>

        {/* ── Back to login ── */}
        {step !== STEPS.SUCCESS && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-[#7d8590] transition hover:text-[#22C55E]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        )}

        {/* ── Security footer ── */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-[#6e7681]">
            Secure by design ·{" "}
            <Link
              href="/security"
              className="underline transition hover:text-[#22C55E]"
            >
              Learn how
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Requirement({ met, children }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
          met ? "bg-[#22C55E]" : "bg-gray-300 dark:bg-[#30363d]"
        }`}
      >
        {met && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
      <span className={met ? "font-semibold text-green-700 dark:text-green-400" : "text-gray-500 dark:text-[#7d8590]"}>
        {children}
      </span>
    </div>
  );
}