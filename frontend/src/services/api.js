import axios from "axios";
import { getToken, removeToken } from "@/utils/helpers";

export const API_BASE = "https://duediligence-agent.duckdns.org";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

let sessionExpiredHandled = false;

const handleSessionExpired = () => {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  try { removeToken(); } catch {}
  if (typeof window !== "undefined") {
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
