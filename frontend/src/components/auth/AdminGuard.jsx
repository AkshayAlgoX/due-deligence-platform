"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/helpers";
import { getCurrentUser } from "@/services/authService";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getCurrentUser();
        if (!cancelled) {
          if (profile?.role === "ADMIN") {
            setAllowed(true);
          } else {
            router.replace("/dashboard");
          }
        }
      } catch {
        if (!cancelled) router.replace("/dashboard");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking || !allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#edf7f3] dark:bg-[#0d1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return children;
}