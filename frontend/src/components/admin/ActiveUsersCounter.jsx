"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { getActiveUsers } from "@/services/adminService";

const POLL_INTERVAL_MS = 15000;

export default function ActiveUsersCounter({ pollIntervalMs = POLL_INTERVAL_MS }) {
  const { t } = useTranslation();
  const [count, setCount] = useState(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const active = await getActiveUsers();
        if (!cancelled) {
          setCount(active);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    fetchCount();
    intervalRef.current = setInterval(fetchCount, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [pollIntervalMs]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
        <Users size={18} />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
            {error ? "—" : count ?? "…"}
          </span>
          {!error && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-[#7d8590]">
          {error ? t("nav.admin.activeUsersFailed") : t("nav.admin.activeUsersNow")}
        </p>
      </div>
    </div>
  );
}