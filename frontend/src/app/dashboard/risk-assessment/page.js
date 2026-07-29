"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  useEffect(() => {
    document.title = "Risk Assessment | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <EmptyState
          icon={AlertTriangle}
          title="Risk Assessment overview coming soon"
          description="Portfolio-wide risk analysis and prioritized action items will appear here."
        />
      </div>
    </div>
  );
}