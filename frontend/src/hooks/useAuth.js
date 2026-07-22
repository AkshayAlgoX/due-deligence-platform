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

import { registerUser, loginUser, logoutUser } from "@/services/authService";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Register a new user.
   * @returns {Promise<{success, message}>} backend response on success
   * @throws {Error} enriched error from api.js (has .status, .errors, .data)
   */
  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await registerUser(formData);
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
    toast.success("You're signed out", {
      description: "You've been logged out successfully.",
    });
    router.push("/login");
  };

  return { loading, register, login, logout };
}