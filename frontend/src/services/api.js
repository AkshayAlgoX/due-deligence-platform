/**
 * Axios instance — shared across all services.
 *
 * No baseURL needed. All API_ROUTES use relative paths (/api/...)
 * which Next.js proxies to http://localhost:8080 via next.config.mjs.
 *
 * 401 → auto-logout + redirect to /login (session expired handler).
 *
 * Logging strategy (dev only):
 *   • 2xx/3xx  → silent
 *   • 4xx      → console.warn (expected user issues — no Next.js overlay)
 *   • 5xx      → console.error (actual server bugs — overlay OK)
 *   • Network  → console.error
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
  toast.error("Session expired", {
    description: "Please log in again to continue.",
  });

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
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const requestUrl = error?.config?.url || "";

    // ─── Smart dev logging ──────────────────────────────────────────────
    // 4xx = expected user-side issue (wrong password, validation, etc.)
    //       → use warn so Next.js dev overlay doesn't scream
    // 5xx = actual server bug worth surfacing loudly
    // No status = network error, offline, CORS, timeout
    if (process.env.NODE_ENV === "development") {
      if (!status) {
        console.error(`[API] Network error on ${requestUrl}`, error?.message);
      } else if (status >= 500 && (data == null || typeof data !== "object")) {
        // Proxy blip (backend unreachable) — warn, don't scream with an overlay
        console.warn(`[API] ${status} on ${requestUrl} — backend unreachable (restarting?)`, data);
      } else if (status >= 500) {
        console.error(`[API] ${status} on ${requestUrl}`, data);
      } else {
        console.warn(`[API] ${status} on ${requestUrl}`, data);
      }
    }

    let message;
    // Preserve field-level errors so forms can highlight specific inputs
    const fieldErrors =
      data?.errors && typeof data.errors === "object" ? data.errors : null;

    if (status === 400) {
      if (fieldErrors) {
        // Prefer the first field error as the toast message
        message = Object.values(fieldErrors)[0] || "Please check your input.";
      } else {
        message = data?.message || "Invalid input. Please check your details.";
      }
    } else if (status === 401) {
      // 401 on auth endpoints → wrong credentials (no auto-logout)
      // 401 elsewhere → session expired (auto-logout + redirect)
      const isAuthAttempt =
        requestUrl.includes("/login") ||
        requestUrl.includes("/google") ||
        requestUrl.includes("/register");

      if (isAuthAttempt) {
        message = data?.message || "Invalid email or password.";
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
    } else if (status === 404) {
      message = data?.message || "The requested resource was not found.";
    } else if (status === 409) {
      message = data?.message || "An account with this email already exists.";
    } else if (status === 429) {
      message = "Too many requests. Please slow down and try again.";
    } else if (status >= 500) {
      // A 5xx with no JSON body means the Next.js proxy couldn't reach the
      // backend (e.g. Spring Boot restarting after a recompile). The backend
      // always returns JSON for real 500s, so this is a proxy blip — retry
      // once instead of showing a scary "Internal Server Error".
      const isProxyBlip = data == null || typeof data !== "object";
      if (isProxyBlip) {
        if (error?.config && !error.config.__proxyRetried) {
          error.config.__proxyRetried = true;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return api.request(error.config);
        }
        message = "The server is restarting. Please try again in a few seconds.";
      } else {
        message =
          data?.message || "Something went wrong on the server. Please try again.";
      }
    } else if (!status) {
      // No status = network layer failure
      message = "Can't reach the server. Check your connection.";
    } else {
      message =
        data?.message ||
        data?.error ||
        error?.message ||
        "An unexpected error occurred.";
    }

    // Build a rich error object so callers can access field errors + status
    const enrichedError = new Error(message);
    enrichedError.status = status;
    enrichedError.errors = fieldErrors;
    enrichedError.data = data;

    return Promise.reject(enrichedError);
  }
);

export default api;