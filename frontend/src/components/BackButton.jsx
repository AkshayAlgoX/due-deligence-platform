"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Smart back button — uses browser history if available,
 * falls back to a safe default route otherwise.
 *
 * @param {string} fallback - Route to go to if there's no history (e.g. direct URL visit)
 */
export default function BackButton({ fallback = "/login", label = "Back" }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-[#7d8590] transition hover:text-gray-900 dark:hover:text-[#e6edf3]"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}