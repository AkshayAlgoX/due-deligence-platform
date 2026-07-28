"use client";

import { useEffect } from "react";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  useEffect(() => {
    document.title = "Audit Logs | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <EmptyState
          icon={ClipboardList}
          title="No audit entries yet"
          description="System actions and user activity will be tracked here for compliance and security review."
        />
      </div>
    </div>
  );
}
