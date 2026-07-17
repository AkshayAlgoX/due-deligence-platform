"use client";

/**
 * <AuthGuard> — Wrap any protected page/component with this.
 *
 * Behavior:
 *   • On mount, checks for a JWT via isAuthenticated().
 *   • If missing → redirects to /login and renders nothing.
 *   • If present → renders {children}.
 *
 * Usage:
 *   <AuthGuard>
 *     <DashboardContent />
 *   </AuthGuard>
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/helpers";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthed(true);
    } else {
      router.replace("/login");
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#edf7f3]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!authed) return null;

  return children;
}