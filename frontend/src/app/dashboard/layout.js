"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}