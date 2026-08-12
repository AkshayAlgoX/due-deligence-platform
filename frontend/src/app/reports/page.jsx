// src/app/reports/page.jsx
// ---------------------------------------------------------------------------
// My Reports — MATCHES DASHBOARD DESIGN SYSTEM
// Tokens: bg-[#161b22] cards, border-[#30363d], text-[#e6edf3], green gradient CTA
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  History,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Home,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useReport } from "@/hooks/useReport";
import { useExport } from "@/hooks/useExport";
import reportService from "@/services/reportService";

import ReportCard from "@/components/reports/ReportCard";
import KpiStatCard from "@/components/reports/KpiStatCard";
import FilterBar from "@/components/reports/FilterBar";
import EmptyState from "@/components/reports/EmptyState";
import ConfirmDialog from "@/components/reports/ConfirmDialog";
import ExportProgressModal from "@/components/export/ExportProgressModal";
import PageHeader from "@/components/ui/PageHeader";

const PAGE_SIZE = 20;

// ─────────────────────── helpers ────────────────────────

function sortReports(reports, sortKey) {
  if (!Array.isArray(reports)) return [];
  const arr = [...reports];
  switch (sortKey) {
    case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "risk-high": return arr.sort((a, b) => (b.riskScoreSnapshot ?? -1) - (a.riskScoreSnapshot ?? -1));
    case "risk-low": return arr.sort((a, b) => (a.riskScoreSnapshot ?? 101) - (b.riskScoreSnapshot ?? 101));
    case "address-az": return arr.sort((a, b) => (a.propertyAddress ?? "").localeCompare(b.propertyAddress ?? ""));
    case "address-za": return arr.sort((a, b) => (b.propertyAddress ?? "").localeCompare(a.propertyAddress ?? ""));
    case "newest":
    default: return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function filterReports(reports, status, query) {
  if (!Array.isArray(reports)) return [];
  let result = reports;
  if (status && status !== "ALL") {
    if (status === "GENERATING") {
      result = result.filter((r) => r.status === "GENERATING" || r.status === "PENDING");
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

function computeKpis(reports) {
  if (!Array.isArray(reports)) return { total: 0, completed: 0, inProgress: 0, failed: 0 };
  return {
    total: reports.length,
    completed: reports.filter((r) => r.status === "COMPLETED").length,
    inProgress: reports.filter((r) => r.status === "GENERATING" || r.status === "PENDING").length,
    failed: reports.filter((r) => r.status === "FAILED").length,
  };
}

function dedupeById(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

// ─────────────────────── Page ───────────────────────

export default function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSort = searchParams.get("sort") || "newest";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlQuery = searchParams.get("q") || "";

  const [sortKey, setSortKey] = useState(urlSort);
  const [activeStatus, setActiveStatus] = useState(urlStatus);
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  const [currentPage, setCurrentPage] = useState(0);
  const [accumulatedReports, setAccumulatedReports] = useState([]);
  const isFirstLoad = useRef(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { reports, pagination, listLoading, listError, fetchList } = useReport();

  useEffect(() => {
    fetchList({ page: 0, size: PAGE_SIZE, sort: "createdAt,desc" });
  }, [fetchList]);

  useEffect(() => {
    if (!reports) return;
    if (isFirstLoad.current || currentPage === 0) {
      setAccumulatedReports(reports);
      isFirstLoad.current = false;
    } else {
      setAccumulatedReports((prev) => dedupeById([...prev, ...reports]));
    }
  }, [reports, currentPage]);

  const rawReports = accumulatedReports;
  const isLoading = listLoading && accumulatedReports.length === 0;
  const isLoadingMore = listLoading && accumulatedReports.length > 0;
  const error = listError;

  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchList({ page: nextPage, size: PAGE_SIZE, sort: "createdAt,desc" });
  }, [currentPage, fetchList]);

  const totalOnServer = pagination?.totalElements ?? accumulatedReports.length;
  const hasMore = accumulatedReports.length < totalOnServer;

  const {
    isGenerating,
    progressStage,
    progressPercent,
    exportFormat,
    downloadPdf,
    downloadExcel,
  } = useExport();

  const refreshList = useCallback(() => {
    setCurrentPage(0);
    setAccumulatedReports([]);
    isFirstLoad.current = true;
    fetchList({ page: 0, size: PAGE_SIZE, sort: "createdAt,desc" });
  }, [fetchList]);

  const handleDeleteRequest = useCallback((reportId) => {
    const report = rawReports.find((r) => r.id === reportId);
    setDeleteTarget({
      id: reportId,
      address: report?.propertyAddress || report?.title || `Report #${reportId}`,
    });
  }, [rawReports]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await reportService.delete(deleteTarget.id);
      toast.success("Report deleted successfully");
      setDeleteTarget(null);
      refreshList();
    } catch (err) {
      console.error("Delete failed:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to delete report. Please try again.";
      toast.error(msg);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, refreshList]);

  const handleDeleteCancel = useCallback(() => {
    if (isDeleting) return;
    setDeleteTarget(null);
  }, [isDeleting]);

  const handleRegenerate = useCallback(
    async (reportId) => {
      try {
        await reportService.regenerate(reportId);
        toast.success("Report regeneration started");
        refreshList();
      } catch (err) {
        console.error("Regenerate failed:", err);
        const msg = err?.response?.data?.message || err.message || "Failed to regenerate report. Please try again.";
        toast.error(msg);
      }
    },
    [refreshList]
  );

  const handleCopyLink = useCallback((reportId) => {
    const url = `${window.location.origin}/reports/${reportId}`;
    navigator.clipboard?.writeText(url)
      .then(() => toast.success("Report link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }, []);

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

  const handleSortChange = useCallback((key) => {
    setSortKey(key);
    syncUrl(key, activeStatus, searchQuery);
  }, [syncUrl, activeStatus, searchQuery]);

  const handleStatusChange = useCallback((status) => {
    setActiveStatus(status);
    syncUrl(sortKey, status, searchQuery);
  }, [syncUrl, sortKey, searchQuery]);

  const handleSearchChange = useCallback((q) => {
    setSearchQuery(q);
    syncUrl(sortKey, activeStatus, q);
  }, [syncUrl, sortKey, activeStatus]);

  const handleClearFilters = useCallback(() => {
    setSortKey("newest");
    setActiveStatus("ALL");
    setSearchQuery("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const kpis = useMemo(() => computeKpis(rawReports), [rawReports]);
  const filteredReports = useMemo(
    () => filterReports(rawReports, activeStatus, searchQuery),
    [rawReports, activeStatus, searchQuery]
  );
  const sortedReports = useMemo(
    () => sortReports(filteredReports, sortKey),
    [filteredReports, sortKey]
  );

  const handleKpiClick = useCallback((status) => {
    const next = activeStatus === status ? "ALL" : status;
    handleStatusChange(next);
  }, [activeStatus, handleStatusChange]);

  const totalCount = pagination?.totalElements ?? kpis.total;

  const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c2128] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 dark:bg-[#1c2128] rounded w-48" />
        <div className="h-2.5 bg-gray-100 dark:bg-[#1c2128] rounded w-32" />
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1c2128] flex-shrink-0" />
    </div>
  );

  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10 space-y-6">

        {/* ══ BREADCRUMB ═══════════════════════════════════════════════ */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          <Home size={14} className="text-gray-400 dark:text-[#6e7681]" aria-hidden="true" />
          <ChevronRight size={13} className="text-gray-300 dark:text-[#30363d]" aria-hidden="true" />
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors duration-150"
          >
            Dashboard
          </Link>
          <ChevronRight size={13} className="text-gray-300 dark:text-[#30363d]" aria-hidden="true" />
          <span className="text-sm text-gray-900 dark:text-[#e6edf3] font-semibold">My Reports</span>
        </nav>

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <PageHeader
          icon={FileText}
          iconGradient="from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20"
          iconBorder="border-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          title="Due Diligence Reports"
          subtitle="Every report. Every risk. Every insight, all in one place."
          actions={
            <>
              <Link
                href="/reports/export-history"
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#22282f] hover:border-gray-300 dark:hover:border-[#3a424c] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50"
              >
                <History size={14} strokeWidth={2} aria-hidden="true" />
                <span className="hidden sm:inline">Export History</span>
              </Link>
              <Link
                href="/dashboard/property-search"
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-white text-sm font-bold shadow-[0_10px_30px_rgba(34,197,94,0.35)] hover:shadow-[0_10px_35px_rgba(34,197,94,0.55)] hover:scale-[1.02] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60"
              >
                <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                <span>New report</span>
              </Link>
            </>
          }
        />

        {/* ══ KPI CARDS ════════════════════════════════════════════════ */}
        <section aria-label="Report statistics">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[116px] rounded-2xl bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiStatCard label="Total" value={totalCount} icon={LayoutGrid} color="slate" onClick={() => handleKpiClick("ALL")} isActive={activeStatus === "ALL"} />
              <KpiStatCard label="Completed" value={kpis.completed} icon={CheckCircle2} color="emerald" onClick={() => handleKpiClick("COMPLETED")} isActive={activeStatus === "COMPLETED"} />
              <KpiStatCard label="In Progress" value={kpis.inProgress} icon={Loader2} color="blue" onClick={() => handleKpiClick("GENERATING")} isActive={activeStatus === "GENERATING"} />
              <KpiStatCard label="Failed" value={kpis.failed} icon={XCircle} color="red" onClick={() => handleKpiClick("FAILED")} isActive={activeStatus === "FAILED"} />
            </div>
          )}
        </section>

        {/* ══ FILTER BAR ═══════════════════════════════════════════════ */}
        <section aria-label="Search and filter">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            sortKey={sortKey}
            onSortChange={handleSortChange}
            totalCount={totalCount}
            filteredCount={sortedReports.length}
          />
        </section>

        {/* ══ REPORT LIST ══════════════════════════════════════════════ */}
        <section aria-label="Report list" aria-live="polite">
          {isLoading && (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}
          {!isLoading && error && <EmptyState variant="error" />}
          {!isLoading && !error && rawReports.length === 0 && <EmptyState variant="no-reports" />}
          {!isLoading && !error && rawReports.length > 0 && sortedReports.length === 0 && (
            <EmptyState
              variant="no-results"
              filterLabel={activeStatus !== "ALL" ? activeStatus.charAt(0) + activeStatus.slice(1).toLowerCase() : ""}
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
                    onDelete={handleDeleteRequest}
                    onRegenerate={handleRegenerate}
                    onCopyLink={handleCopyLink}
                    isExporting={isGenerating}
                    animationDelay={Math.min(index * 0.03, 0.25)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* ══ LOAD MORE + FOOTER ═══════════════════════════════════════ */}
        {!isLoading && !error && rawReports.length > 0 && (
          <div className="pt-2 space-y-4">
            {hasMore && (
              <div className="flex justify-center">
                <motion.button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  whileHover={!isLoadingMore ? { y: -1 } : undefined}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-sm font-medium text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#3a424c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50"
                  aria-label={`Load next ${PAGE_SIZE} reports`}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                      <span>Loading…</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
                      <span>Load {Math.min(PAGE_SIZE, totalOnServer - rawReports.length)} more</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
            {!hasMore && rawReports.length > PAGE_SIZE && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#7d8590]">
                  <div className="h-px w-8 bg-gray-200 dark:bg-[#30363d]" aria-hidden="true" />
                  <span>You have reached the end</span>
                  <div className="h-px w-8 bg-gray-200 dark:bg-[#30363d]" aria-hidden="true" />
                </div>
              </div>
            )}
            <footer className="flex items-center justify-between pt-4 pb-4 border-t border-gray-100 dark:border-[#30363d]">
              <div className="text-xs text-gray-500 dark:text-[#7d8590] space-y-0.5">
                <p>
                  Showing <span className="text-gray-800 dark:text-[#e6edf3] font-medium">{sortedReports.length}</span>
                  {sortedReports.length !== rawReports.length && (
                    <> of <span className="text-gray-800 dark:text-[#e6edf3] font-medium">{rawReports.length}</span> loaded</>
                  )}
                  {" · "}
                  <span className="text-gray-600 dark:text-[#7d8590]">{totalCount} total</span>
                </p>
                {pagination?.totalPages && pagination.totalPages > 1 && (
                  <p className="text-gray-400 dark:text-[#6e7681]">
                    Loaded {Math.ceil(rawReports.length / PAGE_SIZE)} of {pagination.totalPages} pages
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-[#6e7681]">Due Diligence Agent · India</p>
            </footer>
          </div>
        )}
      </div>

      {/* ══ CUSTOM DELETE DIALOG ══════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete this report?"
        description={
          deleteTarget
            ? `"${deleteTarget.address}" will be permanently deleted. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete report"
        cancelLabel="Cancel"
        variant="danger"
        isConfirming={isDeleting}
      />

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