"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { loginUser } from "@/services/authService";
import GuestGuard from "@/components/GuestGuard";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Headphones,
  CheckCircle,
  Loader2,
  KeyRound,
  UserCheck,
  AlertCircle,
} from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // ── inline field validator (uses t()) ──────────────────────────────────────
  const validateField = (field, value) => {
    const trimmed = String(value ?? "").trim();
    switch (field) {
      case "email":
        if (!trimmed) return t("auth.errors.emailRequired");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
          return t("auth.errors.emailInvalid");
        return "";
      case "password":
        if (!trimmed) return t("auth.errors.passwordRequired");
        if (trimmed.length < 8) return t("auth.errors.passwordLength");
        return "";
      default:
        return "";
    }
  };

  // ── submit validator ───────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = t("auth.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = t("auth.errors.emailInvalid");
    }
    if (!password) errors.password = t("auth.errors.passwordRequired");
    return errors;
  };

  useEffect(() => {
    if (fieldErrors.email && emailRef.current) {
      emailRef.current.focus();
    } else if (fieldErrors.password && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [fieldErrors]);

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    const minDuration = new Promise((resolve) => setTimeout(resolve, 400));
    try {
      await Promise.all([
        loginUser({ email: email.trim().toLowerCase(), password, rememberMe }),
        minDuration,
      ]);
      toast.success(t("auth.login.title"), {
        description: t("auth.login.redirectingToDashboard"),
      });
      router.push("/dashboard");
    } catch (err) {
      await minDuration;
      if (err.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
        toast.error(t("auth.errors.fieldErrors"), {
          description: t("auth.errors.someFieldsNeedAttention"),
        });
      } else {
        toast.error(t("auth.errors.signInFailed"), {
          description: err.message || t("auth.errors.checkCredentials"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFieldErrors((prev) => ({
      ...prev,
      email: validateField("email", e.target.value),
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFieldErrors((prev) => ({
      ...prev,
      password: validateField("password", e.target.value),
    }));
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleContactSupport = () => {
    window.open("/support", "_blank", "noopener,noreferrer");
  };

  const getInputClasses = (hasError) =>
    `h-10 rounded-xl pl-10 text-sm focus-visible:ring-2 transition-colors
     bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3]
     placeholder:text-gray-400 dark:placeholder:text-[#6e7681]
     ${
       hasError
         ? "border-red-300 dark:border-red-800 focus-visible:ring-red-400"
         : "border-gray-200 dark:border-[#30363d] focus-visible:ring-green-500 dark:focus-visible:ring-green-700"
     }`;

  return (
    <main className="h-screen overflow-hidden bg-[#edf7f3] dark:bg-[#0d1117]">
      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden bg-white dark:bg-[#0d1117]">

        {/* ── Left Section ── */}
        <section className="flex w-full flex-col items-center bg-[#f8fffb] dark:bg-[#0d1117] px-8 py-6 lg:w-[40%]">
          <div className="flex w-full max-w-[420px] flex-col">

            {/* Logo — brand name stays English per rule #7 */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-[18px] font-extrabold tracking-tight text-[#22C55E]">
                Real Estate Due Diligence Agent
              </h1>
            </div>

            {/* Welcome */}
            <div className="mt-5">
              <h2 className="text-[36px] font-black leading-[40px] tracking-tight text-[#111827] dark:text-[#e6edf3]">
                {t("auth.login.title")}
              </h2>
              <p className="mt-2 text-sm leading-5 text-gray-500 dark:text-[#7d8590]">
                {t("auth.login.subtitle")}
              </p>
            </div>

            {/* Login form card */}
            <form
              onSubmit={handleLogin}
              noValidate
              className="mt-4 w-full rounded-[28px] border border-white dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]"
                  htmlFor="email"
                >
                  {t("auth.login.emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t("auth.login.emailPlaceholder")}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
                    className={getInputClasses(!!fieldErrors.email)}
                  />
                </div>
                {fieldErrors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-[11px] text-red-500 dark:text-red-400 leading-tight pl-1"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between">
                  <label
                    className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]"
                    htmlFor="password"
                  >
                    {t("auth.login.passwordLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-green-500 hover:underline"
                  >
                    {t("auth.login.forgotPassword")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]" />
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={handlePasswordKeyEvent}
                    onKeyUp={handlePasswordKeyEvent}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password
                        ? "password-error"
                        : capsLockOn && passwordFocused
                        ? "caps-lock-warning"
                        : undefined
                    }
                    className={`${getInputClasses(!!fieldErrors.password)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? t("auth.login.hidePassword")
                        : t("auth.login.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {capsLockOn && passwordFocused && !fieldErrors.password && (
                  <p
                    id="caps-lock-warning"
                    className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 leading-tight pl-1"
                  >
                    <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                    {t("auth.forgotPassword.capsLock")}
                  </p>
                )}

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-[11px] text-red-500 dark:text-red-400 leading-tight pl-1"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-xs text-gray-600 dark:text-[#7d8590]"
                >
                  {t("auth.login.rememberMe")}
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#22C55E] text-sm font-bold shadow-[0_12px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] hover:bg-[#16a34a] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t("auth.login.signIn")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="my-4 flex items-center">
                <div className="h-px flex-1 bg-gray-200 dark:bg-[#30363d]" />
                <span className="mx-3 text-[10px] text-gray-500 dark:text-[#6e7681]">
                  {t("auth.login.orContinueWith")}
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-[#30363d]" />
              </div>

              {/* Google + Support */}
              <div className="space-y-2.5">
                <GoogleSignInButton />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleContactSupport}
                  className="h-10 w-full rounded-xl border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-[#7d8590] text-xs transition hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                >
                  <Headphones className="mr-1.5 h-3.5 w-3.5" />
                  {t("auth.login.contactSupport")}
                </Button>
              </div>
            </form>

            {/* Register link */}
            <div className="mt-3 text-center text-xs text-gray-600 dark:text-[#7d8590]">
              {t("auth.login.newToPlatform")}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="ml-1 font-semibold text-green-500 hover:underline"
              >
                {t("auth.login.createAccount")}
              </button>
            </div>

            {/* Feature bullets */}
            <div className="mt-4 space-y-1.5">
              {[
                t("auth.login.features.analysis"),
                t("auth.login.features.auditing"),
                t("auth.login.features.risk"),
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-[#0d2818]">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-[#7d8590]">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Security footer */}
            <div className="mt-4 border-t border-gray-200 dark:border-[#30363d] pt-3 text-center">
              <p className="text-[10px] text-gray-500 dark:text-[#6e7681]">
                {t("auth.login.secureBy")} ·{" "}
                <Link
                  href="/security"
                  className="underline hover:text-[#22C55E] transition"
                >
                  {t("auth.login.learnHow")}
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Right Section ── */}
        <section className="relative hidden overflow-hidden rounded-l-3xl lg:block lg:w-[60%]">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
            alt={t("auth.login.imgAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-sky-700/50 to-blue-500/40" />

          <div className="absolute right-8 top-8 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {t("auth.login.platformOnline")}
          </div>

          <div className="absolute bottom-8 left-8 w-[420px] rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("auth.login.builtForTrust")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              {t("auth.login.platformDesc")}
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {t("auth.login.verifiedListings")}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {t("auth.login.verifiedListingsDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <KeyRound className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {t("auth.login.secureByDefault")}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {t("auth.login.secureByDefaultDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {t("auth.login.roleBasedAccess")}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {t("auth.login.roleBasedAccessDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginPageInner />
    </GuestGuard>
  );
}