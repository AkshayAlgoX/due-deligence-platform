"use client";

/**
 * useAuth hook
 * Manages async state for register / login.
 * All API shapes match the actual Spring Boot backend.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginUser, logoutUser } from "@/services/authService";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
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
      setSuccess(data.message || "Account created successfully! Please sign in.");
      // Navigate to login after a short delay so user can read the message
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const msg = err.message || "Registration failed. Please try again.";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists")
      ) {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login an existing user.
   * Backend response: AuthResponse { token: string }
   * On success → navigate to /dashboard
   */
  const login = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await loginUser(formData);
      setSuccess("Login successful! Redirecting…");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  /** Logout and return to login page. */
  const logout = () => {
    logoutUser();
    router.push("/login");
  };

  return { loading, error, success, register, login, logout };
}
