"use client";

import React, { useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/helpers";
import ConnectionStatus from "@/components/layout/ConnectionStatus";

export default function DashboardLayout({ children }) {
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
      <MainLayout>
        <ConnectionStatus />
        {children}
      </MainLayout>
    </AuthGuard>
  );
}