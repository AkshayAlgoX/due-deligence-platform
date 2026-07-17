"use client";

/**
 * useAuth hook
 * Manages async state for register / login / logout.
 * All API shapes match the actual Spring Boot backend.
 *
 * Also emits toast notifications via sonner:
 *   • Register success / failure
 *   • Login    success / failure
 *   • Logout   success
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerUser, loginUser, logoutUser } from "@/services/authService";

export function useAuth() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Register a new user.
   * Backend response: ApiResponse { success: boolean, message: string }
   * On success → navigate to /login (user still needs to log in to get a token)
   */
  const register = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await registerUser(formData);

      const msg =
        data.message || "Account created successfully! Please sign in.";

      setSuccess(msg);
      toast.success(msg);

      // Navigate to login after a short delay so user can read the toast
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const raw = err.message || "Registration failed. Please try again.";

      // Friendlier message when email is already taken
      const finalMsg =
        raw.toLowerCase().includes("already") ||
        raw.toLowerCase().includes("exists")
          ? "An account with this email already exists. Please sign in."
          : raw;

      setError(finalMsg);
      toast.error(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login an existing user.
   * Backend response: AuthResponse { token: string }
   * On success → navigate to /dashboard
   *
   * @param {{ email, password, rememberMe? }} formData
   */
  const login = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await loginUser(formData); // supports rememberMe flag

      const msg = "Login successful! Redirecting…";
      setSuccess(msg);
      toast.success(msg);

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      const msg = err.message || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** Logout and return to login page. */
  const logout = () => {
    logoutUser();
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  return { loading, error, success, register, login, logout };
}