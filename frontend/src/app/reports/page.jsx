// src/app/reports/page.jsx
// ---------------------------------------------------------------------------
// My Reports — Premium redesign (Phase 1)
// Compact header · KPI cards · FilterBar · ReportCard list · EmptyState
// URL-persisted sort + filter (?sort=newest&status=ALL&q=)
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  History,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { useReport } from "@/hooks/useReport";
import { useExport } from "@/hooks/useExport";
import reportService from "@/services/reportService";

import ReportCard from "@/components/reports/ReportCard";
import KpiStatCard from "@/components/reports/KpiStatCard";
import FilterBar from "@/components/reports/FilterBar";
import EmptyState from "@/components/reports/EmptyState";
import ExportProgressModal from "@/components/export/ExportProgressModal";

// ---------------------------------------------------------------------------
// Sorting logic
// ---------------------------------------------------------------------------

function sortReports(reports, sortKey) {
  if (!Array.isArray(reports)) return [];
  const arr = [...reports];

  switch (sortKey) {
    case "oldest":
      return arr.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "risk-high":
      return arr.sort(
        (a, b) => (b.riskScoreSnapshot ?? -1) - (a.riskScoreSnapshot ?? -1)
      );
    case "risk-low":
      return arr.sort(
        (a, b) => (a.riskScoreSnapshot ?? 101) - (b.riskScoreSnapshot ?? 101)
      );
    case "address-az":
      return arr.sort((a, b) =>
        (a.propertyAddress ?? "").localeCompare(b.propertyAddress ?? "")
      );
    case "address-za":
      return arr.sort((a, b) =>
        (b.propertyAddress ?? "").localeCompare(a.propertyAddress ?? "")
      );
    case "newest":
    default:
      return arr.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  }
}

// ---------------------------------------------------------------------------
// Filter logic
// ---------------------------------------------------------------------------

function filterReports(reports, status, query) {
  if (!Array.isArray(reports)) return [];
  let result = reports;

  if (status && status !== "ALL") {
    if (status === "GENERATING") {
      result = result.filter(
        (r) => r.status === "GENERATING" || r.status === "PENDING"
      );
    } else {
      result = result.filter((r) => r.status === status);
    }
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (r) =>
        (r.propertyAddress ?? "").toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q)
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// KPI computation
// ---------------------------------------------------------------------------

function computeKpis(reports) {
  if (!Array.isArray(reports)) {
    return { total: 0, completed: 0, inProgress: 0, failed: 0 };
  }
  return {
    total: reports.length,
    completed: reports.filter((r) => r.status === "COMPLETED").length,
    inProgress: reports.filter(
      (r) => r.status === "GENERATING" || r.status === "PENDING"
    ).length,
    failed: reports.filter((r) => r.status === "FAILED").length,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── URL-synced state ───────────────────────────────────────────────────
  const urlSort = searchParams.get("sort") || "newest";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlQuery = searchParams.get("q") || "";

  const [sortKey, setSortKey] = useState(urlSort);
  const [activeStatus, setActiveStatus] = useState(urlStatus);
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  // ── Data — CORRECTED useReport API usage ─────────────────────────────
  const {
    reports,
    pagination,
    listLoading,
    listError,
    fetchList,
  } = useReport();

  // Initial fetch — deliberately once on mount
  useEffect(() => {
    fetchList({ page: 0, size: 200, sort: "createdAt,desc" });
  }, [fetchList]);

  const rawReports = reports ?? [];
  const isLoading = listLoading;
  const error = listError;

  // ── Export ────────────────────────────────────────────────────────────
  const {
    isGenerating,
    progressStage,
    progressPercent,
    exportFormat,
    downloadPdf,
    downloadExcel,
  } = useExport();

  // ── Delete handler ────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (reportId) => {
      if (!window.confirm("Delete this report? This action cannot be undone."))
        return;
      try {
        await reportService.delete(reportId);
        fetchList({ page: 0, size: 200, sort: "createdAt,desc" });
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [fetchList]
  );

  // ── Regenerate handler ────────────────────────────────────────────────
  const handleRegenerate = useCallback(
    async (reportId) => {
      try {
        await reportService.regenerate(reportId);
        fetchList({ page: 0, size: 200, sort: "createdAt,desc" });
      } catch (err) {
        console.error("Regenerate failed:", err);
      }
    },
    [fetchList]
  );

  // ── URL sync ──────────────────────────────────────────────────────────
  const syncUrl = useCallback(
    (newSort, newStatus, newQuery) => {
      const params = new URLSearchParams();
      if (newSort && newSort !== "newest") params.set("sort", newSort);
      if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
      if (newQuery && newQuery.trim()) params.set("q", newQuery.trim());
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleSortChange = useCallback(
    (key) => {
      setSortKey(key);
      syncUrl(key, activeStatus, searchQuery);
    },
    [syncUrl, activeStatus, searchQuery]
  );

  const handleStatusChange = useCallback(
    (status) => {
      setActiveStatus(status);
      syncUrl(sortKey, status, searchQuery);
    },
    [syncUrl, sortKey, searchQuery]
  );

  const handleSearchChange = useCallback(
    (q) => {
      setSearchQuery(q);
      syncUrl(sortKey, activeStatus, q);
    },
    [syncUrl, sortKey, activeStatus]
  );

  const handleClearFilters = useCallback(() => {
    setSortKey("newest");
    setActiveStatus("ALL");
    setSearchQuery("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // ── Derived data ───────────────────────────────────────────────────────
  const kpis = useMemo(() => computeKpis(rawReports), [rawReports]);

  const filteredReports = useMemo(
    () => filterReports(rawReports, activeStatus, searchQuery),
    [rawReports, activeStatus, searchQuery]
  );

  const sortedReports = useMemo(
    () => sortReports(filteredReports, sortKey),
    [filteredReports, sortKey]
  );

  // ── KPI click → set status filter ─────────────────────────────────────
  const handleKpiClick = useCallback(
    (status) => {
      const next = activeStatus === status ? "ALL" : status;
      handleStatusChange(next);
    },
    [activeStatus, handleStatusChange]
  );

  // ── Skeleton row ─────────────────────────────────────────────────────
  const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/5 rounded w-48" />
        <div className="h-2.5 bg-white/5 rounded w-32" />
      </div>
      <div className="w-12 h-12 rounded-full bg-white/5 flex-shrink-0" />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────
  // NOTE: No `bg-*` on the outer container — inherit from app shell.
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-6 py-8 lg:px-10 space-y-7">

        {/* ══ HEADER ══════════════════════════════════════════════════════ */}
        <header className="space-y-5">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400/80 hover:text-slate-200 transition-colors duration-150"
            >
              Dashboard
            </Link>
            <ChevronRight
              size={12}
              className="text-slate-600"
              aria-hidden="true"
            />
            <span className="text-xs text-slate-200 font-medium">
              My Reports
            </span>
          </nav>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                aria-hidden="true"
              >
                <FileText size={18} strokeWidth={1.75} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                  Due Diligence Reports
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                  AI-generated property risk analysis · India
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Link
                href="/export-history"
                className="
                  flex items-center gap-2 h-9 px-3.5 rounded-lg
                  bg-white/[0.03] border border-white/10
                  text-sm text-slate-300 hover:text-white
                  hover:bg-white/[0.06] hover:border-white/20
                  transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                "
              >
                <History size={14} strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden sm:inline">Export History</span>
              </Link>

              <Link
                href="/generate"
                className="
                  flex items-center gap-2 h-9 px-4 rounded-lg
                  bg-emerald-500 hover:bg-emerald-400
                  text-slate-950 text-sm font-semibold
                  shadow-md shadow-emerald-900/30
                  transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60
                "
              >
                <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
                <span>New report</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ══ KPI CARDS ═══════════════════════════════════════════════════ */}
        <section aria-label="Report statistics">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[108px] rounded-xl bg-white/[0.02] border border-white/5"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiStatCard
                label="Total"
                value={kpis.total}
                icon={LayoutGrid}
                color="slate"
                onClick={() => handleKpiClick("ALL")}
                isActive={activeStatus === "ALL"}
              />
              <KpiStatCard
                label="Completed"
                value={kpis.completed}
                icon={CheckCircle2}
                color="emerald"
                onClick={() => handleKpiClick("COMPLETED")}
                isActive={activeStatus === "COMPLETED"}
              />
              <KpiStatCard
                label="In Progress"
                value={kpis.inProgress}
                icon={Loader2}
                color="blue"
                onClick={() => handleKpiClick("GENERATING")}
                isActive={activeStatus === "GENERATING"}
              />
              <KpiStatCard
                label="Failed"
                value={kpis.failed}
                icon={XCircle}
                color="red"
                onClick={() => handleKpiClick("FAILED")}
                isActive={activeStatus === "FAILED"}
              />
            </div>
          )}
        </section>

        {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
        <section aria-label="Search and filter">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            sortKey={sortKey}
            onSortChange={handleSortChange}
            totalCount={kpis.total}
            filteredCount={sortedReports.length}
          />
        </section>

        {/* ══ REPORT LIST ═════════════════════════════════════════════════ */}
        <section aria-label="Report list" aria-live="polite">
          {isLoading && (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {!isLoading && error && <EmptyState variant="error" />}

          {!isLoading && !error && kpis.total === 0 && (
            <EmptyState variant="no-reports" />
          )}

          {!isLoading && !error && kpis.total > 0 && sortedReports.length === 0 && (
            <EmptyState
              variant="no-results"
              filterLabel={
                activeStatus !== "ALL"
                  ? activeStatus.charAt(0) + activeStatus.slice(1).toLowerCase()
                  : ""
              }
              searchQuery={searchQuery}
              onClearFilters={handleClearFilters}
            />
          )}

          {!isLoading && !error && sortedReports.length > 0 && (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {sortedReports.map((report, index) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onDownloadPdf={downloadPdf}
                    onDownloadExcel={downloadExcel}
                    onDelete={handleDelete}
                    onRegenerate={handleRegenerate}
                    isExporting={isGenerating}
                    animationDelay={Math.min(index * 0.04, 0.3)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* ══ FOOTER META ════════════════════════════════════════════════ */}
        {!isLoading && !error && kpis.total > 0 && (
          <footer className="flex items-center justify-between pt-2 pb-4">
            <p className="text-xs text-slate-500">
              {kpis.total} report{kpis.total !== 1 ? "s" : ""} in workspace
              {pagination?.totalElements && pagination.totalElements > kpis.total
                ? ` (${pagination.totalElements} total on server)`
                : ""}
            </p>
            <p className="text-xs text-slate-600">
              Due Diligence Agent · India
            </p>
          </footer>
        )}
      </div>

      {/* Export progress modal */}
      {isGenerating && (
        <ExportProgressModal
          isOpen={isGenerating}
          stage={progressStage}
          percent={progressPercent}
          format={exportFormat}
        />
      )}
    </div>
  );
}