/**
 * Axios instance — shared across all services.
 *
 * No baseURL needed. All API_ROUTES use relative paths (/api/...)
 * which Next.js proxies to http://localhost:8080 via next.config.mjs.
 *
 * 401 → auto-logout + redirect to /login (session expired handler).
 */
import axios from "axios";
import { toast } from "sonner";
import { getToken, removeToken } from "@/utils/helpers";


const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Prevent multiple session-expired toasts from stacking ────────────────────
let sessionExpiredHandled = false;

/** Fully logs the user out and redirects them to /login. */
const handleSessionExpired = () => {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  removeToken();
  toast.error("Session expired. Please log in again.");

  // Reset the guard shortly after so future 401s (on next session) can toast again
  setTimeout(() => {
    sessionExpiredHandled = false;
  }, 3000);

  if (typeof window !== "undefined") {
    // Use a hard redirect so any in-memory state is cleared.
    window.location.href = "/login";
  }
};

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const requestUrl = error?.config?.url || "";

    if (process.env.NODE_ENV === "development") {
      console.error(`[API ERROR] Status: ${status}`, data);
    }

    let message;

    if (status === 400) {
      const fieldErrors = data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        message = Object.values(fieldErrors)[0];
      } else {
        message = data?.message || "Invalid input. Please check your details.";
      }
   } else if (status === 401) {
  // If 401 came from /login endpoint → wrong credentials
  // Otherwise → session expired
  const isLoginRequest = requestUrl.includes("/login") ||
                         requestUrl.includes("/google") ||
                         requestUrl.includes("/register");
  if (isLoginRequest) {
    message = "Invalid credentials or session issue. Please try again.";
  } else {
    message = "Session expired. Please log in again.";
    handleSessionExpired();
  }
} else if (status === 403) {
  const isAuthEndpoint = requestUrl.includes("/auth/");

  if (isAuthEndpoint) {
    message = data?.message || "Authentication failed. Please try again.";
  } else {
    message = "You do not have permission to perform this action.";
  }
} else if (status === 409) {
      message = "An account with this email already exists.";
    } else if (status === 500) {
      message = data?.message || "Something went wrong on the server. Please try again.";
    } else {
      message =
        data?.message ||
        data?.error ||
        error?.message ||
        "An unexpected error occurred.";
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
