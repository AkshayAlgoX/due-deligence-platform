"use client";

/**
 * <AuthGuard> — Wrap any protected page/component with this.
 *
 * Behavior:
 *   • Checks JWT via isAuthenticated().
 *   • Missing → redirects to /login and renders nothing.
 *   • Present → checks role against ROUTE_ROLES for current path.
 *     - Not allowed → toast + redirect to /dashboard.
 *     - Allowed → renders {children}.
 *
 * This replaces middleware.ts because Next.js 16 Turbopack has broken
 * proxy.ts redirects. Client-side RBAC is standard practice.
 */
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { isAuthenticated, getUser } from "@/utils/helpers";

// ── RBAC: same route → roles map as sidebar ──
const ROUTE_ROLES = {
  "/dashboard/audit-logs": ["ADMIN"],
  "/dashboard/reports": [
    "REAL_ESTATE_AGENT",
    "LEGAL_REVIEWER",
    "FINANCIAL_INSTITUTION",
    "ADMIN",
  ],
  "/dashboard/admin": ["ADMIN"],
};

/** Returns true if the given role can access the given pathname. */
function canAccessPath(pathname, role) {
  for (const [route, allowedRoles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(role);
    }
  }
  return true; // no restriction → allow
}

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Step 1: not logged in → login page
    if (!isAuthenticated()) {
      router.replace("/login");
      setChecking(false);
      return;
    }

    // Step 2: logged in → check role for current path
    const user = getUser();
    const role = user?.role ?? "";

    if (!canAccessPath(pathname, role)) {
  toast.error("You don't have permission to access that page.");
  // Delay redirect so toast has time to render (100ms is imperceptible)
  setTimeout(() => router.replace("/dashboard"), 150);
  setChecking(false);
  return;
}

    // Step 3: authorized
    setAuthed(true);
    setChecking(false);
  }, [router, pathname]);

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