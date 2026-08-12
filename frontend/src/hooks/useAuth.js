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
 * Language behavior on logout (professional — like Zillow/Netflix):
 *   - Current browser language is preserved in localStorage
 *   - Next user sees the LAST browser choice (not previous user's choice)
 *   - Language stays with the BROWSER, not with individual user accounts
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getUser } from "@/utils/helpers";
import i18n from "@/i18n";

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

  /**
   * Logout — clears session, preserves language, redirects to /login.
   *
   * IMPORTANT: We explicitly persist the current i18n language BEFORE
   * clearing session storage. This way:
   *  - Admin (Hindi) logs out → language stays Hindi
   *  - Next user opens login → sees Hindi (browser preference)
   *  - Language follows the BROWSER, not the user account
   *  - Matches behavior of Zillow, Netflix, Airbnb
   */
  /** Returns true if the current user has the ADMIN role. */
  const isAdmin = () => getUser()?.role === "ADMIN";
  const logout = () => {
    // 1. Capture current language before ANY storage is cleared
    const currentLang = i18n.language || "en";

    // 2. Clear auth session (removes token + user + cookies)
    logoutUser();

    // 3. Explicitly re-persist language in localStorage
    //    (i18next-browser-languagedetector reads this on next load)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("i18nextLng", currentLang);
      } catch {
        /* localStorage disabled — ignore */
      }
    }

    // 4. Show localized farewell toast
    toast.success(t("completeProfile.toasts.signedOut.title"), {
      description: t("completeProfile.toasts.signedOut.description"),
    });

    // 5. Redirect to login — replace() so the back button can't
    //    restore the authenticated dashboard from bfcache
    router.replace("/login");
  };

 return {
    loading,
    startRegistration,
    verifyOtpAndRegister,
    resendOtp,
    login,
    logout,
    isAdmin,
  };
}