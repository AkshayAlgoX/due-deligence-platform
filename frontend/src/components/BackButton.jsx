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
    // If user came from another page in our app, use browser back
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Direct URL visit — send to safe fallback
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}