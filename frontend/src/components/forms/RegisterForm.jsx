"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ShieldCheck, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/hooks/useAuth";
import { validateRegisterForm } from "@/utils/validators";
import { getPasswordStrength } from "@/utils/helpers";
import { ROLES } from "@/constants/roles";
import { APP_NAME } from "@/constants/appConstants";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

// ── Inline SVG icons (unchanged) ─────────────────────────────────────────────
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, htmlFor, error, required, children, t }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 leading-tight">
          {t ? t(error) : error}
        </p>
      )}
    </div>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────────
function StrengthBar({ strength }) {
  if (!strength) return null;
  const colors = {
    Weak:   "bg-red-500",
    Fair:   "bg-yellow-400",
    Good:   "bg-blue-500",
    Strong: "bg-green-500",
  };
  const widths = {
    Weak:   "w-1/4",
    Fair:   "w-2/4",
    Good:   "w-3/4",
    Strong: "w-full",
  };
  return (
    <div className="mt-1">
      <div className="h-0.5 w-full rounded-full bg-gray-100 dark:bg-[#30363d] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[strength.label]} ${widths[strength.label]}`}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterForm() {
  const { loading, register } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    phoneNumber: "", role: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const refs = {
    fullName:        useRef(null),
    email:           useRef(null),
    password:        useRef(null),
    confirmPassword: useRef(null),
    phoneNumber:     useRef(null),
  };

  // ── inline field validator (needs t()) ────────────────────────────────────
  const validateField = (field, value) => {
    const trimmed = String(value ?? "").trim();
    switch (field) {
      case "email":
        if (!trimmed) return t("auth.errors.emailRequired");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t("auth.errors.emailInvalid");
        return "";
      case "password":
        if (!trimmed) return t("auth.errors.passwordRequired");
        if (trimmed.length < 8) return t("auth.errors.passwordLength");
        if (!/[A-Za-z]/.test(trimmed)) return t("auth.errors.passwordLetter");
        if (!/\d/.test(trimmed)) return t("auth.errors.passwordNumber");
        return "";
      case "fullName":
        if (!trimmed) return t("auth.register.errors.fullNameRequired");
        if (trimmed.length < 3) return t("auth.register.errors.fullNameShort");
        return "";
      case "phoneNumber":
        if (!/^[6-9]\d{9}$/.test(trimmed)) return t("auth.register.errors.phoneInvalid");
        return "";
      case "role":
        if (!trimmed) return t("auth.register.errors.roleRequired");
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
    setFieldErrors((prev) => ({ ...prev, role: validateField("role", value) }));
  };

  useEffect(() => {
    const order = ["fullName", "email", "password", "confirmPassword", "phoneNumber"];
    for (const key of order) {
      if (fieldErrors[key] && refs[key]?.current) {
        refs[key].current.focus();
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrors]);

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    const minDuration = new Promise((resolve) => setTimeout(resolve, 400));
    try {
      await Promise.all([
        register({
          fullName:    form.fullName.trim(),
          email:       form.email.trim().toLowerCase(),
          password:    form.password,
          phoneNumber: form.phoneNumber.trim(),
          role:        form.role,
        }),
        minDuration,
      ]);
      setJustRegistered(true);
      toast.success(t("auth.register.toasts.welcome"), {
        description: t("auth.register.toasts.welcomeDesc"),
      });
      setTimeout(() => { window.location.href = "/dashboard"; }, 800);
    } catch (err) {
      await minDuration;
      const backendMsg = err?.message || "";
      if (backendMsg.toLowerCase().includes("email") && backendMsg.toLowerCase().includes("exist")) {
        setFieldErrors({ email: t("auth.register.errors.emailExists") });
        toast.error(t("auth.register.toasts.emailRegistered"), {
          description: t("auth.register.toasts.emailRegisteredDesc"),
        });
      } else if (err?.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
        toast.error(t("auth.errors.fieldErrors"), {
          description: t("auth.errors.someFieldsNeedAttention"),
        });
      } else {
        toast.error(t("auth.register.toasts.failed"), {
          description: backendMsg || t("auth.register.toasts.tryAgain"),
        });
      }
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  const getInputClasses = (hasError) =>
    `h-10 rounded-xl pl-9 text-sm focus-visible:ring-2 transition-colors
     bg-white dark:bg-[#0d1117]
     text-gray-900 dark:text-[#e6edf3]
     placeholder:text-gray-400 dark:placeholder:text-[#6e7681]
     ${hasError
       ? "border-red-300 dark:border-red-800 focus-visible:ring-red-400"
       : "border-gray-200 dark:border-[#30363d] focus-visible:ring-green-500 dark:focus-visible:ring-green-700"
     }`;

  return (
    <div className="w-full">

      {/* Brand Header — APP_NAME stays English per rule #7 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-[#22C55E]">
          {APP_NAME}
        </h1>
      </div>

      {/* Title */}
      <h2 className="mt-5 text-[36px] font-black leading-[40px] tracking-tight text-[#111827] dark:text-[#e6edf3]">
        {t("auth.register.title")}
      </h2>
      <p className="mt-2 text-sm leading-5 text-gray-500 dark:text-[#7d8590]">
        {t("auth.register.subtitle")}
      </p>

      {/* Form Card */}
      <div className="mt-4 w-full rounded-[24px] border border-white dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <form onSubmit={handleSubmit} noValidate className="space-y-3">

          {/* Row 1: Full Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.register.fields.fullName")} htmlFor="fullName" error={fieldErrors.fullName} required t={t}>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-[#6e7681] pointer-events-none z-10">
                  <UserIcon />
                </span>
                <Input
                  ref={refs.fullName}
                  id="fullName"
                  type="text"
                  placeholder={t("auth.register.placeholders.fullName")}
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  disabled={loading || justRegistered}
                  aria-invalid={!!fieldErrors.fullName}
                  autoComplete="name"
                  className={getInputClasses(!!fieldErrors.fullName)}
                />
              </div>
            </Field>

<Field label={t("auth.register.fields.email")} htmlFor="email" error={fieldErrors.email} required t={t}>

              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-[#6e7681] pointer-events-none z-10">
                  <MailIcon />
                </span>
                <Input
                  ref={refs.email}
                  id="email"
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={form.email}
                  onChange={handleChange("email")}
                  disabled={loading || justRegistered}
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  className={getInputClasses(!!fieldErrors.email)}
                />
              </div>
            </Field>
          </div>

          {/* Row 2: Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.login.passwordLabel")} htmlFor="password" error={fieldErrors.password} required t={t}>

              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-[#6e7681] pointer-events-none z-10">
                  <LockIcon />
                </span>
                <Input
                  ref={refs.password}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.register.placeholders.password")}
                  value={form.password}
                  onChange={handleChange("password")}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={loading || justRegistered}
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="new-password"
                  className={`${getInputClasses(!!fieldErrors.password)} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3] z-10"
                  aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {form.password && <StrengthBar strength={passwordStrength} />}
              {capsLockOn && passwordFocused && !fieldErrors.password && (
                <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 leading-tight mt-1">
                  <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                  {t("auth.forgotPassword.capsLock")}
                </p>
              )}
            </Field>

               <Field label={t("auth.register.fields.confirm")} htmlFor="confirmPassword" error={fieldErrors.confirmPassword} required t={t}>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-[#6e7681] pointer-events-none z-10">
                  <LockIcon />
                </span>
                <Input
                  ref={refs.confirmPassword}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.register.placeholders.confirm")}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  disabled={loading || justRegistered}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  autoComplete="new-password"
                  className={`${getInputClasses(!!fieldErrors.confirmPassword)} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3] z-10"
                  aria-label={showConfirmPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>
          </div>

          {/* Row 3: Phone + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.register.fields.phoneNumber")} htmlFor="phoneNumber" error={fieldErrors.phoneNumber} required t={t}>
              <div className="relative flex">
                <div
                  className={`
                    flex items-center gap-1 h-10 px-3
                    rounded-l-xl border border-r-0
                    bg-gray-50 dark:bg-[#1c2128]
                    text-xs font-semibold text-gray-600 dark:text-[#7d8590]
                    select-none
                    ${fieldErrors.phoneNumber
                      ? "border-red-300 dark:border-red-800"
                      : "border-gray-200 dark:border-[#30363d]"
                    }
                  `}
                  aria-hidden="true"
                >
                  <span className="text-sm">🇮🇳</span>
                  <span>+91</span>
                </div>
                <Input
                  ref={refs.phoneNumber}
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder={t("auth.register.placeholders.phone")}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setForm((prev) => ({ ...prev, phoneNumber: digitsOnly }));
                    setFieldErrors((prev) => ({ ...prev, phoneNumber: validateField("phoneNumber", digitsOnly) }));
                  }}
                  disabled={loading || justRegistered}
                  aria-invalid={!!fieldErrors.phoneNumber}
                  autoComplete="tel-national"
                  className={`
                    h-10 rounded-l-none rounded-r-xl text-sm
                    focus-visible:ring-2 transition-colors
                    bg-white dark:bg-[#0d1117]
                    text-gray-900 dark:text-[#e6edf3]
                    placeholder:text-gray-400 dark:placeholder:text-[#6e7681]
                    ${fieldErrors.phoneNumber
                      ? "border-red-300 dark:border-red-800 focus-visible:ring-red-400"
                      : "border-gray-200 dark:border-[#30363d] focus-visible:ring-green-500 dark:focus-visible:ring-green-700"
                    }
                  `}
                />
              </div>
            </Field>

            <Field label={t("auth.register.fields.role")} htmlFor="role" error={fieldErrors.role} required t={t}>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-[#6e7681] pointer-events-none z-10">
                  <BriefcaseIcon />
                </span>
                <Select
                  value={form.role}
                  onValueChange={handleRoleChange}
                  disabled={loading || justRegistered}
                >
                  <SelectTrigger
                    hideIcon
                    id="role"
                    className={`h-10 w-full rounded-xl border pl-9 pr-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-0 focus:border-transparent
                      bg-white dark:bg-[#0d1117]
                      text-gray-900 dark:text-[#e6edf3]
                      data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-[#6e7681]
                      ${fieldErrors.role
                        ? "border-red-300 dark:border-red-800"
                        : "border-gray-200 dark:border-[#30363d]"
                      }`}
                    aria-invalid={!!fieldErrors.role}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-left">
                        {form.role
                          ? ROLES.find((r) => r.value === form.role)?.label
                          : t("auth.register.placeholders.role")}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-[#6e7681]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </SelectTrigger>

                  <SelectContent
                    className="z-50 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[min(380px,calc(100vw-2rem))]"
                    position="popper"
                    side="bottom"
                    align="end"
                    sideOffset={6}
                  >
                    {ROLES.map((role) => {
                      const RoleIcon = role.icon;
                      return (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-3 pl-3 pr-9 text-sm outline-none
                            text-gray-900 dark:text-[#e6edf3]
                            focus:bg-green-50 dark:focus:bg-[#0d2818]
                            focus:text-green-700 dark:focus:text-green-400
                            data-[state=checked]:bg-green-50 dark:data-[state=checked]:bg-[#0d2818]
                            data-[state=checked]:text-green-700 dark:data-[state=checked]:text-green-400
                            data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#0d1117] flex items-center justify-center">
                              <RoleIcon className="h-4 w-4 text-gray-600 dark:text-[#7d8590]" strokeWidth={2} />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-sm font-semibold leading-tight">
                                {role.label}
                              </span>
                              {role.description && (
                                <span className="text-[11px] text-gray-500 dark:text-[#7d8590] font-normal leading-snug">
                                  {role.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || justRegistered}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-[#22C55E] text-sm font-bold shadow-[0_12px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] hover:bg-[#16a34a] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("auth.register.pleaseWait")}
              </span>
            ) : justRegistered ? (
              <span>{t("auth.register.welcomeCheck")}</span>
            ) : (
              <>
                {t("auth.register.createAccount")}
                <span className="ml-2"><ArrowRight /></span>
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

          <GoogleSignInButton />
        </form>
      </div>

      {/* Sign in link */}
      <p className="mt-3 text-center text-xs text-gray-600 dark:text-[#7d8590]">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
        >
          {t("auth.register.signIn")}
        </Link>
      </p>

      {/* Security footer */}
      <div className="mt-4 border-t border-gray-200 dark:border-[#30363d] pt-3 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
          {t("auth.register.secureByDesign")}
        </p>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-[#6e7681]">
          {t("auth.register.securityTagline")}
        </p>
      </div>
    </div>
  );
}