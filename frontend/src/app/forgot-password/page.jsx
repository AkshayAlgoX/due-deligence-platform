"use client";

import { useState } from "react";
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
} from "lucide-react";

import { forgotPassword, verifyResetOtp, resetPassword } from "@/services/authService";

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  PASSWORD: 3,
  SUCCESS: 4,
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Step 1: Submit email ────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      toast.success(res.message || "Reset code sent!");
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Please enter the 6-digit code");

    setLoading(true);
    try {
      await verifyResetOtp({ email, otp: code });
      toast.success("Code verified!");
      setStep(STEPS.PASSWORD);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ──────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords don't match");

    setLoading(true);
    try {
      await resetPassword({
        email,
        otp: otp.join(""),
        newPassword,
      });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling (auto-focus next) ────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only digits, max 1
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace → focus previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    if (pasted.length === 6) document.getElementById(`otp-5`)?.focus();
  };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, mid, domain) => `${first}${"*".repeat(Math.min(mid.length, 4))}${domain}`)
    : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#edf7f3] via-white to-[#f8fffb] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/30">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[18px] font-black tracking-tight bg-gradient-to-r from-[#22C55E] to-[#16a34a] bg-clip-text text-transparent">
            Real Estate Due Diligence
          </h1>
        </div>

        {/* Progress dots */}
        {step !== STEPS.SUCCESS && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step
                    ? "w-8 bg-[#22C55E]"
                    : s < step
                    ? "w-6 bg-green-300"
                    : "w-6 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
          {/* ── STEP 1: Email ── */}
          {step === STEPS.EMAIL && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-inner">
                  <KeyRound className="h-6 w-6 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">
                  Forgot password?
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  No worries — enter your email and we'll send you a reset code.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      disabled={loading}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:scale-[1.01] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Reset Code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEPS.OTP && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-inner">
                  <Mail className="h-6 w-6 text-blue-600" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  We sent a 6-digit code to
                </p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {maskedEmail}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      className="h-12 w-11 rounded-xl border-2 border-gray-200 bg-white text-center text-lg font-black outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(STEPS.EMAIL)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Wrong email? Change it
                  </button>
                </div>
              </form>

              <div className="mt-4 rounded-xl bg-green-50 p-3 text-center ring-1 ring-green-100">
                <p className="text-[11px] font-semibold text-green-800">
                  ✉️ Check your inbox (and spam folder) for the code
                </p>
              </div>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEPS.PASSWORD && (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-inner">
                  <KeyRound className="h-6 w-6 text-purple-600" strokeWidth={2} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">
                  Set new password
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Choose a strong password to secure your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                  />
                </div>

                {/* Requirements checklist */}
                <div className="space-y-1 rounded-xl bg-gray-50 p-3">
                  <Requirement met={newPassword.length >= 8}>
                    At least 8 characters
                  </Requirement>
                  <Requirement met={newPassword && newPassword === confirmPassword}>
                    Passwords match
                  </Requirement>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:scale-[1.01] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-3xl bg-green-400/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/40 ring-4 ring-white">
                  <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900">
                Password reset!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Your password has been updated successfully.
                <br />
                You can now sign in with your new password.
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:scale-[1.01]"
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        {step !== STEPS.SUCCESS && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-[#22C55E]"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Small helper component ─────────────────────────────────────────
function Requirement({ met, children }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
          met ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        {met && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
      <span className={met ? "font-semibold text-green-700" : "text-gray-500"}>
        {children}
      </span>
    </div>
  );
}
