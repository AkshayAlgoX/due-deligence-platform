import axios from "axios";
import { getToken, removeToken } from "@/utils/helpers";

export const API_BASE = "https://duediligence-agent.duckdns.org";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = typeof getToken === "function" ? getToken() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const isAuth = /login|register|\/auth\//.test(url);
    if (status === 401 && !isAuth && typeof window !== "undefined") {
      try { removeToken(); } catch (_) {}
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
