"use client";

import { useEffect } from "react";
import { FileText } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function ReportsPage() {
  useEffect(() => {
    document.title = "Reports | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <EmptyState
          icon={FileText}
          title="Reports coming soon"
          description="Generate portfolio reports, risk summaries, and due diligence documents. This feature is under development."
        />
      </div>
    </div>
  );
}
