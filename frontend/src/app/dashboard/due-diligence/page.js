"use client";

import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  useEffect(() => {
    document.title = "Due Diligence | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <EmptyState
          icon={ShieldCheck}
          title="Due Diligence dashboard coming soon"
          description="Consolidated view of all your properties' due diligence status will appear here."
        />
      </div>
    </div>
  );
}
