"use client";

import React, { useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/helpers";

export default function DashboardLayout({ children }) {
  // ── bfcache guard ──────────────────────────────────────────────
  // When the user logs out and presses the browser BACK button, the
  // browser restores this page from its back/forward cache WITHOUT
  // re-running React effects — briefly showing stale "logged-in" UI.
  // On pageshow with e.persisted=true (bfcache restore), force an
  // auth recheck and bounce to /login if the token is gone.
  useEffect(() => {
    const handler = (e) => {
      if (e.persisted && !isAuthenticated()) {
        window.location.href = "/login";
      }
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
