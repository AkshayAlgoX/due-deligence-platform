/**
 * Axios instance — ALWAYS hits EC2 via DuckDNS HTTPS.
 * Do NOT use relative /api paths (Vercel still routes those to dead Render).
 */
import axios from "axios";
import { toast } from "sonner";
import { getToken, removeToken } from "@/utils/helpers";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://duediligence-agent.duckdns.org";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let sessionExpiredHandled = false;

const handleSessionExpired = () => {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  try { removeToken(); } catch {}
  if (typeof window !== "undefined") {
    try { toast.error("Session expired. Please sign in again."); } catch {}
    window.location.href = "/login";
  }
};

api.interceptors.request.use((config) => {
  try {
    const token = getToken?.();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall =
      String(url).includes("/login") ||
      String(url).includes("/register") ||
      String(url).includes("/auth/");
    if (status === 401 && !isAuthCall) handleSessionExpired();
    return Promise.reject(error);
  }
);

export default api;
