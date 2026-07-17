"use client";

/**
 * RegisterForm — Premium compact version matching Login page aesthetic.
 *
 * Uses shadcn/ui components throughout for consistency.
 * Uses lucide-react's ShieldCheck for perfect brand consistency with Login.
 */

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// ── shadcn/ui components ──────────────────────────────────────────────────────
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── project utilities ─────────────────────────────────────────────────────────
import { useAuth } from "@/hooks/useAuth";
import { validateRegisterForm } from "@/utils/validators";
import { getPasswordStrength } from "@/utils/helpers";
import { ROLES } from "@/constants/roles";
import { APP_NAME } from "@/constants/appConstants";

// ── Inline SVG icons ──────────────────────────────────────────────────────────
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
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24"
    fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Compact labelled field ────────────────────────────────────────────────────
function Field({ label, htmlFor, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="text-[10px] text-red-500 mt-0.5 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Compact password strength bar ─────────────────────────────────────────────
function StrengthBar({ strength }) {
  if (!strength) return null;
  const colors = {
    Weak: "bg-red-500",
    Fair: "bg-yellow-400",
    Good: "bg-blue-500",
    Strong: "bg-green-500",
  };
  const widths = {
    Weak: "w-1/4",
    Fair: "w-2/4",
    Good: "w-3/4",
    Strong: "w-full",
  };
  return (
    <div className="mt-1">
      <div className="h-0.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[strength.label]} ${widths[strength.label]}`}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterForm() {
  const { loading, error, success, register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
    if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await register({
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phoneNumber: form.phoneNumber.trim(),
      role: form.role,
    });
  };

  const passwordStrength = getPasswordStrength(form.password);

  // Shared input classes matching Login page
  const inputClasses =
    "h-10 rounded-xl border-gray-200 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-green-500";

  return (
    <div className="w-full">

      {/* ── Brand Header (matches Login exactly) ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-[#22C55E]">
          {APP_NAME}
        </h1>
      </div>

      {/* ── Title (matches Login typography) ── */}
      <h2 className="mt-5 text-[36px] font-black leading-[40px] tracking-tight text-[#111827]">
        Create Your Account
      </h2>
      <p className="mt-2 text-sm leading-5 text-gray-500">
        Join the platform to begin secure due diligence.
      </p>

      {/* ── Form Card ── */}
      <div className="mt-4 w-full rounded-[24px] border border-white bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

        {/* Success / Error alerts */}
        {success && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 flex items-center gap-2">
            <CheckIcon />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">

          {/* Row 1: Full Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" htmlFor="fullName" error={fieldErrors.fullName} required>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <UserIcon />
                </span>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.fullName}
                  autoComplete="name"
                  className={inputClasses}
                />
              </div>
            </Field>

            <Field label="Email" htmlFor="email" error={fieldErrors.email} required>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <MailIcon />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  className={inputClasses}
                />
              </div>
            </Field>
          </div>

          {/* Row 2: Password + Confirm Password */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" htmlFor="password" error={fieldErrors.password} required>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <LockIcon />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 chars"
                  value={form.password}
                  onChange={handleChange("password")}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="new-password"
                  className={`${inputClasses} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {form.password && <StrengthBar strength={passwordStrength} />}
            </Field>

            <Field
              label="Confirm"
              htmlFor="confirmPassword"
              error={fieldErrors.confirmPassword}
              required
            >
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <LockIcon />
                </span>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  autoComplete="new-password"
                  className={`${inputClasses} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>
          </div>

          {/* Row 3: Phone + Role (shadcn Select) */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone Number"
              htmlFor="phoneNumber"
              error={fieldErrors.phoneNumber}
              required
            >
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <PhoneIcon />
                </span>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.phoneNumber}
                  autoComplete="tel"
                  className={inputClasses}
                />
              </div>
            </Field>

            <Field label="Role" htmlFor="role" error={fieldErrors.role} required>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none z-10">
                  <BriefcaseIcon />
                </span>
                <Select
                  value={form.role}
                  onValueChange={handleRoleChange}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="role"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-0 focus:border-transparent data-[placeholder]:text-gray-400 [&>span]:truncate"
                    aria-invalid={!!fieldErrors.role}
                  >
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 rounded-xl border border-gray-200 bg-white shadow-xl"
                    position="popper"
                    sideOffset={4}
                  >
                    {ROLES.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        className="rounded-lg text-sm cursor-pointer py-2 px-3 my-0.5 focus:bg-green-50 focus:text-green-700 data-[state=checked]:bg-green-100 data-[state=checked]:text-green-700"
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </div>

          {/* Submit Button — matches Login exactly */}
          <Button
            type="submit"
            disabled={loading || !!success}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-[#22C55E] text-sm font-bold shadow-[0_12px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] hover:bg-[#16a34a]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Please wait…
              </span>
            ) : (
              <>
                Create Account
                <span className="ml-2">
                  <ArrowRight />
                </span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="mt-3 text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>

      {/* Compact footer */}
      <div className="mt-4 border-t border-gray-200 pt-3 text-[10px] uppercase tracking-widest text-gray-400 text-center">
        <p>Enterprise Grade Compliance &amp; Security</p>
        <p className="mt-0.5">ISO 27001 Certified · SOC2 Type II Compliant</p>
      </div>

    </div>
  );
}