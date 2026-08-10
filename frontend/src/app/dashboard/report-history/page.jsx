"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";

import ReportHistoryCard from "@/components/history/ReportHistoryCard";
import ReportHistoryEmpty from "@/components/history/ReportHistoryEmpty";
import ReportHistoryFilters from "@/components/history/ReportHistoryFilters";

import useReportHistory from "@/hooks/useReportHistory";
import reportService from "@/services/reportService";

export default function ReportHistoryPage() {
  const { t } = useTranslation();

  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await reportService.list({
          page: 0,
          size: 50,
          sort: "createdAt,desc",
        });

        let reportsData = [];

        if (Array.isArray(response?.content)) {
          reportsData = response.content;
        } else if (Array.isArray(response)) {
          reportsData = response;
        } else if (Array.isArray(response?.data?.content)) {
          reportsData = response.data.content;
        } else if (Array.isArray(response?.data)) {
          reportsData = response.data;
        }

        if (mounted) {
          setAllReports(reportsData);
        }
      } catch (err) {
        console.error(
          "Failed to load report history:",
          err
        );

        if (mounted) {
          setError(
            t("reportHistory.errors.loadFailed")
          );
          setAllReports([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, [t]);

  const {
    reports,
    filters,
    setFilters,
    resetFilters,
  } = useReportHistory(allReports);

  const handleFilterChange = (changes) => {
    setFilters((prev) => ({
      ...prev,
      ...changes,
    }));
  };

  const handleSelectReport = (report) => {
    console.log("Selected report:", report);
  };

  /*
   * Keep all displayed numbers as English digits.
   */
  const formatNumber = (value) => {
    return String(value ?? 0);
  };

  /*
   * Normalize the risk value.
   */
  const getRiskKey = (report) => {
    const value = String(
      report?.riskLevelSnapshot ||
        report?.riskLevel ||
        "LOW"
    ).toUpperCase();

    if (value === "MODERATE") {
      return "MEDIUM";
    }

    if (
      value === "LOW" ||
      value === "MEDIUM" ||
      value === "HIGH" ||
      value === "CRITICAL"
    ) {
      return value;
    }

    return "LOW";
  };

  /*
   * Report History statistics.
   *
   * Total = all filtered reports.
   * Low = LOW.
   * Medium = MEDIUM / MODERATE.
   * High = HIGH + CRITICAL.
   */
  const riskStats = useMemo(() => {
    const stats = {
      total: reports?.length || 0,
      low: 0,
      medium: 0,
      high: 0,
    };

    (reports || []).forEach((report) => {
      const risk = getRiskKey(report);

      if (risk === "LOW") {
        stats.low += 1;
      } else if (risk === "MEDIUM") {
        stats.medium += 1;
      } else if (
        risk === "HIGH" ||
        risk === "CRITICAL"
      ) {
        stats.high += 1;
      }
    });

    return stats;
  }, [reports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117]">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
              <History className="h-5 w-5 text-white dark:text-gray-900" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                {t("reportHistory.title")}
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
                {t("reportHistory.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
                <History
                  className="h-5 w-5 text-white dark:text-gray-900"
                  strokeWidth={2.25}
                />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
                {t("reportHistory.title")}
              </h1>
            </div>

            <p className="ml-13 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("reportHistory.description")}
            </p>
          </div>

          {/* Refresh intentionally removed */}
        </div>

        {/* =========================================================
            RISK STATISTICS
        ========================================================= */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* TOTAL */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("reportHistory.stats.total")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-gray-700 dark:text-[#e6edf3]">
              {formatNumber(riskStats.total)}
            </div>
          </div>

          {/* LOW RISK */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("reportHistory.stats.lowRisk")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-green-500">
              {formatNumber(riskStats.low)}
            </div>
          </div>

          {/* MEDIUM RISK */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("reportHistory.stats.mediumRisk")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-yellow-500">
              {formatNumber(riskStats.medium)}
            </div>
          </div>

          {/* HIGH RISK */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("reportHistory.stats.highRisk")}
              </span>
            </div>

            <div className="text-2xl font-black tabular-nums text-red-500">
              {formatNumber(riskStats.high)}
            </div>
          </div>
        </div>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* =========================================================
            FILTERS
        ========================================================= */}
        <div className="mb-5">
          <ReportHistoryFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        {/* =========================================================
            REPORT COUNT
        ========================================================= */}
        <div className="mb-4 text-sm text-gray-500 dark:text-[#7d8590]">
          {t("reportHistory.showing", {
            count: formatNumber(reports.length),
          })}
        </div>

        {/* =========================================================
            REPORTS
        ========================================================= */}
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportHistoryCard
                key={report.id}
                report={report}
                onSelect={handleSelectReport}
              />
            ))}
          </div>
        ) : (
          <ReportHistoryEmpty />
        )}
      </div>
    </div>
  );
}