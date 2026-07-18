"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { isAuthenticated } from "@/utils/helpers";

/**
 * Root landing page — routes users based on auth state.
 *
 * TODO: Replace with proper marketing landing page in Batch 7
 * (hero, features, testimonials, pricing, CTA to signup).
 * For now, this just ensures no one lands here confused.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fffb]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/30">
          <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-[#22C55E]" />
      </div>
    </main>
  );
}