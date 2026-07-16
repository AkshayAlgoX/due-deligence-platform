"use client";

/**
 * RegisterForm — uses shadcn/ui components from @/components/ui/
 *
 * Fields match RegisterRequest.java exactly:
 *   fullName    → @NotBlank, @Size(min=3, max=100)
 *   email       → @NotBlank, @Email
 *   password    → @NotBlank, @Size(min=8, max=20)
 *   phoneNumber → @NotBlank, @Pattern(^[6-9]\d{9}$)
 *   role        → @NotNull, RoleType enum
 *
 * confirmPassword is frontend-only (not sent to backend).
 */

import { useState } from "react";
import Link from "next/link";

// ── shadcn/ui components ──────────────────────────────────────────────────────
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── project utilities ─────────────────────────────────────────────────────────
import { useAuth }              from "@/hooks/useAuth";
import { validateRegisterForm } from "@/utils/validators";
import { getPasswordStrength }  from "@/utils/helpers";
import { ROLES }                from "@/constants/roles";
import { APP_NAME }             from "@/constants/appConstants";

// ── Inline SVG icons (no extra icon library needed) ───────────────────────────
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

// ── Labelled field wrapper ─────────────────────────────────────────────────────
function Field({ label, htmlFor, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// ── Password strength bar ──────────────────────────────────────────────────────
function StrengthBar({ strength }) {
  if (!strength) return null;
  const colors = { Weak: "bg-red-500", Fair: "bg-yellow-400", Good: "bg-blue-500", Strong: "bg-green-500" };
  const widths = { Weak: "w-1/4", Fair: "w-2/4", Good: "w-3/4", Strong: "w-full" };
  const textColors = { Weak: "text-red-500", Fair: "text-yellow-500", Good: "text-blue-500", Strong: "text-green-600" };
  return (
    <div className="mt-1">
      <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${colors[strength.label]} ${widths[strength.label]}`} />
      </div>
      <p className={`text-xs mt-0.5 font-medium ${textColors[strength.label]}`}>{strength.label} password</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RegisterForm() {
  const { loading, error, success, register } = useAuth();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    confirmPassword: "", phoneNumber: "", role: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword]         = useState(false);
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
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    await register({
      fullName:    form.fullName.trim(),
      email:       form.email.trim().toLowerCase(),
      password:    form.password,
      phoneNumber: form.phoneNumber.trim(),
      role:        form.role,
    });
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-md shadow-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-green-600 font-bold text-sm tracking-wide">{APP_NAME}</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Join the platform to begin secure property due diligence.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-4">

        {/* ── Success / Error alerts ── */}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckIcon />
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

          {/* Full Name */}
          <Field label="Full Name" htmlFor="fullName" error={fieldErrors.fullName} required>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
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
                className="pl-8"
              />
            </div>
          </Field>

          {/* Email */}
          <Field label="Professional Email" htmlFor="email" error={fieldErrors.email} required>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
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
                className="pl-8"
              />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password" htmlFor="password" error={fieldErrors.password} required>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
                <LockIcon />
              </span>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange("password")}
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                autoComplete="new-password"
                className="pl-8 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {form.password && <StrengthBar strength={passwordStrength} />}
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword} required>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
                <LockIcon />
              </span>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                disabled={loading}
                aria-invalid={!!fieldErrors.confirmPassword}
                autoComplete="new-password"
                className="pl-8 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>

          {/* Phone Number */}
          <Field label="Phone Number" htmlFor="phoneNumber" error={fieldErrors.phoneNumber} required>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 pointer-events-none">
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
                className="pl-8"
              />
            </div>
          </Field>

          {/* Role */}
          <Field label="Select Role" htmlFor="role" error={fieldErrors.role} required>
            <Select
              value={form.role}
              onValueChange={handleRoleChange}
              disabled={loading}
            >
              <SelectTrigger
                id="role"
                aria-invalid={!!fieldErrors.role}
                className="w-full"
              >
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !!success}
            className="w-full mt-1 py-5 bg-green-500 hover:bg-green-600 text-white text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Please wait…
              </span>
            ) : "Create Account →"}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
            Sign In
          </Link>
        </p>

        {/* Trust badges */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {["Comprehensive Property Analysis", "Secure Due Diligence Auditing", "Automated Risk Assessment"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </div>
              {item}
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-wide">
          Enterprise Grade Compliance &amp; Security · ISO 27001 Certified · SOC2 Type II Compliant
        </p>

      </CardContent>
    </Card>
  );
}
