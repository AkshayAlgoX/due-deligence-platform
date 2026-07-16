"use client";

/**
 * RegisterForm
 *
 * Fields match RegisterRequest.java exactly:
 *   fullName   → @NotBlank, @Size(min=3, max=100)
 *   email      → @NotBlank, @Email
 *   password   → @NotBlank, @Size(min=8, max=20)
 *   phoneNumber→ @NotBlank, @Pattern(^[6-9]\d{9}$)
 *   role       → @NotNull, RoleType enum
 *
 * confirmPassword is a frontend-only UX guard (not sent to backend).
 */
import { useState } from "react";
import Link from "next/link";

import Input         from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import Select        from "@/components/common/Select";
import Button        from "@/components/common/Button";
import Alert         from "@/components/common/Alert";

import { useAuth }              from "@/hooks/useAuth";
import { validateRegisterForm } from "@/utils/validators";
import { getPasswordStrength }  from "@/utils/helpers";
import { ROLES }                from "@/constants/roles";
import { APP_NAME }             from "@/constants/appConstants";

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterForm() {
  const { loading, error, success, register } = useAuth();

  const [form, setForm] = useState({
    fullName:        "",
    email:           "",
    password:        "",
    confirmPassword: "",
    phoneNumber:     "",
    role:            "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear this field's error as the user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    // Send only the fields the backend expects — exclude confirmPassword
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
    <div className="w-full animate-fadeIn">

      {/* ── Header ── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-md shadow-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-green-600 font-bold text-sm tracking-wide">{APP_NAME}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h1>
        <p className="text-sm text-gray-500">
          Join the platform to begin secure property due diligence.
        </p>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} />
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

        {/* Full Name */}
        <Input
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Smith"
          value={form.fullName}
          onChange={handleChange("fullName")}
          error={fieldErrors.fullName}
          icon={UserIcon}
          autoComplete="name"
          disabled={loading}
          required
        />

        {/* Professional Email */}
        <Input
          id="email"
          label="Professional Email"
          type="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={handleChange("email")}
          error={fieldErrors.email}
          icon={MailIcon}
          autoComplete="email"
          disabled={loading}
          required
        />

        {/* Password + strength bar */}
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={handleChange("password")}
          error={fieldErrors.password}
          autoComplete="new-password"
          disabled={loading}
          required
          strengthBar={passwordStrength}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
          required
        />

        {/* Phone Number */}
        <Input
          id="phoneNumber"
          label="Phone Number"
          type="tel"
          placeholder="9876543210"
          value={form.phoneNumber}
          onChange={handleChange("phoneNumber")}
          error={fieldErrors.phoneNumber}
          icon={PhoneIcon}
          autoComplete="tel"
          disabled={loading}
          required
        />

        {/* Role */}
        <Select
          id="role"
          label="Select Role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES}
          placeholder="Choose your role"
          error={fieldErrors.role}
          disabled={loading}
          required
        />

        {/* Submit button */}
        <Button
          type="submit"
          loading={loading}
          disabled={loading || !!success}
          fullWidth
          className="mt-1 py-3 text-base"
        >
          Create Account →
        </Button>
      </form>

      {/* ── Footer link ── */}
      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>

      {/* ── Trust badges ── */}
      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
        {[
          "Comprehensive Property Analysis",
          "Secure Due Diligence Auditing",
          "Automated Risk Assessment",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24"
                fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            {item}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-gray-400 uppercase tracking-wide">
        Enterprise Grade Compliance &amp; Security · ISO 27001 Certified · SOC2 Type II Compliant
      </p>

    </div>
  );
}
