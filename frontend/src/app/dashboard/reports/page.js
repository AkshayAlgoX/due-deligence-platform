"use client";

import { useEffect } from "react";

export default function ReportsPage() {
  useEffect(() => {
    document.title = "Reports | Real Estate Due Diligence";
  }, []);
  return null; // AuthGuard will redirect before this renders
}
