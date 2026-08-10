"use client";

import ReportHistoryCard from "./ReportHistoryCard";

export default function ReportHistoryList({ reports = [] }) {
  if (!reports.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-[#30363d] dark:bg-[#161b22]">
        <p className="text-sm text-gray-500 dark:text-[#7d8590]">
          No reports found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <ReportHistoryCard
          key={report.id}
          report={report}
        />
      ))}
    </div>
  );
}