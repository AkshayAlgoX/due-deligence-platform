"use client";

/**
 * useAuth hook — thin wrapper around auth services.
 *
 * Responsibilities:
 *   - Track loading state
 *   - Call the service
 *   - Throw on error (so forms can handle field-level UX)
 *   - Return data on success (so forms can decide what to do next)
 *
 * NOT responsible for:
 *   - Toasts (forms handle their own — allows per-form messaging)
 *   - Navigation (forms handle their own — allows different post-auth flows)
 *
 * This keeps the hook reusable across login page, register page, modals, etc.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  loginUser,
  logoutUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
} from "@/services/authService";

export function useAuth() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  /**
   * Step 1 of registration: send OTP.
   * Does NOT create the account. Returns metadata for OTP modal.
   */
  const startRegistration = async (formData) => {
    setLoading(true);
    try {
      const data = await sendRegistrationOtp(formData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2 of registration: verify OTP → creates account + auto-login.
   * Returns { token } on success.
   */
  const verifyOtpAndRegister = async (payload) => {
    setLoading(true);
    try {
      const data = await verifyRegistrationOtp(payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Step 3: resend OTP (rate-limited server-side). */
  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const data = await resendRegistrationOtp(email);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login an existing user.
   * @returns {Promise<{token}>} auth response on success
   * @throws {Error} enriched error from api.js
   */
  const login = async (formData) => {
    setLoading(true);
    try {
      const data = await loginUser(formData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Logout — clears session and redirects to /login. */
    const logout = () => {
    logoutUser();
    toast.success(t("completeProfile.toasts.signedOut.title"), {
      description: t("completeProfile.toasts.signedOut.description"),
    });
    router.push("/login");
  };
  return {
    loading,
    startRegistration,
    verifyOtpAndRegister,
    resendOtp,
    login,
    logout,
  };
}