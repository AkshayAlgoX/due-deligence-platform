/**
 * Axios instance — shared across all services.
 *
 * No baseURL needed. All API_ROUTES use relative paths (/api/...)
 * which Next.js proxies to http://localhost:8080 via next.config.mjs.
 */
import axios from "axios";
import { getToken } from "@/utils/helpers";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log every outgoing request so you can see exactly what is being sent
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
    const status  = error?.response?.status;
    const data    = error?.response?.data;

    // Log full error details in dev so nothing is hidden
    if (process.env.NODE_ENV === "development") {
      console.error(`[API ERROR] Status: ${status}`, data);
    }

    let message;

    if (status === 400) {
      // GlobalExceptionHandler returns { success, message, errors: { field: msg } }
      // Show the first field-level error if present, otherwise the top-level message
      const fieldErrors = data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        message = Object.values(fieldErrors)[0];
      } else {
        message = data?.message || "Invalid input. Please check your details.";
      }
    } else if (status === 401) {
      message = "Invalid email or password.";
    } else if (status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (status === 409) {
      message = "An account with this email already exists.";
    } else if (status === 500) {
      // Backend threw an unhandled exception (RuntimeException, enum parse error, etc.)
      // Give the user a clean message — the real cause is in the backend logs
      message = data?.message || "Something went wrong on the server. Please try again.";
    } else {
      message =
        data?.message ||
        data?.error  ||
        error?.message ||
        "An unexpected error occurred.";
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
