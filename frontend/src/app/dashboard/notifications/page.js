"use client";

import { useEffect } from "react";
import { Bell } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  useEffect(() => {
    document.title = "Notifications | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No new notifications. We'll alert you when properties need attention or reports are ready."
        />
      </div>
    </div>
  );
}