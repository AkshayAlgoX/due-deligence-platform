"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-white to-[#F0FDF4] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Big 404 with gradient */}
        <div className="mb-6">
          <h1 className="text-[120px] font-black leading-none bg-gradient-to-br from-[#22C55E] to-[#16a34a] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Page not found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>

          <Link
            href="/dashboard/property-search"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Search className="h-4 w-4" />
            Search Properties
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </button>
      </div>
    </div>
  );
}