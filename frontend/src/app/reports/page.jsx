// frontend/src/app/reports/page.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useReport } from "@/hooks/useReport";
import reportService from "@/services/reportService";

import ReportCard from "@/components/reports/ReportCard";
import ReportSkeleton from "@/components/reports/ReportSkeleton";

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["ALL", "COMPLETED", "GENERATING", "PENDING", "FAILED"];

export default function MyReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    reports,
    pagination,
    listLoading,
    listError,
    fetchList,
  } = useReport();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ── Fetch on mount + when page/filter changes ──
  const loadReports = useCallback(() => {
    fetchList({ page, size: PAGE_SIZE, sort: "createdAt,desc" }).catch((err) => {
      console.error("Failed to load reports:", err);
    });
  }, [fetchList, page]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ── Filter reports client-side (status + search) ──
  const filteredReports = useMemo(() => {
    let out = reports || [];
    if (statusFilter !== "ALL") {
      out = out.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      out = out.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.propertyAddress?.toLowerCase().includes(q)
      );
    }
    return out;
  }, [reports, statusFilter, searchQuery]);

  // ── Stats for header ──
  const stats = useMemo(() => {
    const totals = {
      total: reports?.length || 0,
      completed: 0,
      inProgress: 0,
      failed: 0,
    };
    (reports || []).forEach((r) => {
      if (r.status === "COMPLETED") totals.completed++;
      else if (r.status === "PENDING" || r.status === "GENERATING")
        totals.inProgress++;
      else if (r.status === "FAILED") totals.failed++;
    });
    return totals;
  }, [reports]);

  // ── Delete handling ──
  const handleDeleteRequest = (report) => {
    setReportToDelete(report);
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;

    const id = reportToDelete.id;
    setDeletingId(id);
    setReportToDelete(null);
    setDeleteConfirmText("");

    try {
      await reportService.delete(id);
      toast.success(t("report.list.deleted", "Report deleted"));
      loadReports();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(
        t("report.list.deleteFailed", "Failed to delete report"),
        {
          description: err?.response?.data?.message || err.message,
        }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setReportToDelete(null);
    setDeleteConfirmText("");
  };

  // ── Pagination handlers ──
  const canGoBack = page > 0;
  const canGoForward = pagination && page < pagination.totalPages - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* ══════════════════════════════════════════════════════════
          BREADCRUMB HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("report.list.backToDashboard", "Dashboard")}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-[#484f58]" />
          <span className="text-gray-900 dark:text-[#e6edf3] font-medium">
            {t("report.list.title", "My Reports")}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ══════════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                <FileText
                  className="w-5 h-5 text-white dark:text-gray-900"
                  strokeWidth={2.25}
                />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-[#e6edf3] tracking-tight">
                {t("report.list.heading", "My Reports")}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-[#7d8590] ml-13">
              {t(
                "report.list.subheading",
                "Due diligence reports generated across all your properties."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              disabled={listLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors disabled:opacity-50"
              title={t("report.list.refresh", "Refresh")}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${listLoading ? "animate-spin" : ""}`}
                strokeWidth={2.25}
              />
              {t("report.list.refresh", "Refresh")}
            </button>
            <Link
  href="/dashboard/property-search"
  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] active:scale-[0.97]"
>
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
  <Plus className="w-4 h-4 relative z-10" strokeWidth={2.5} />
  <span className="relative z-10">
    {t("report.list.generateNew", "Generate new")}
  </span>
</Link>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════════════════════ */}
        {!listLoading && reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <StatChip
              label={t("report.list.stat.total", "Total")}
              value={pagination?.totalElements ?? stats.total}
              color="#7d8590"
            />
            <StatChip
              label={t("report.list.stat.completed", "Completed")}
              value={stats.completed}
              color="#22C55E"
            />
            <StatChip
              label={t("report.list.stat.inProgress", "In progress")}
              value={stats.inProgress}
              color="#3B82F6"
              pulse={stats.inProgress > 0}
            />
            <StatChip
              label={t("report.list.stat.failed", "Failed")}
              value={stats.failed}
              color="#EF4444"
            />
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            FILTERS BAR
        ══════════════════════════════════════════════════════════ */}
        {!listLoading && reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#6e7681]"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "report.list.searchPlaceholder",
                  "Search by title or address…"
                )}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-sm text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-400 dark:placeholder:text-[#6e7681] focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-[#484f58] transition-colors"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter
                className="w-3.5 h-3.5 text-gray-400 dark:text-[#6e7681] flex-shrink-0"
                strokeWidth={2}
              />
              {STATUS_FILTERS.map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all
                      ${isActive
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#7d8590] hover:bg-gray-200 dark:hover:bg-[#30363d]"
                      }
                    `}
                  >
                    {status === "ALL"
                      ? t("report.list.filter.all", "All")
                      : t(`report.status.${status.toLowerCase()}`, status)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            LIST / STATES
        ══════════════════════════════════════════════════════════ */}

        {/* Loading state */}
        {listLoading && !reports.length && <ReportSkeleton count={5} />}

        {/* Error state */}
        {listError && !listLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 p-8 text-center"
          >
            <AlertCircle
              className="w-10 h-10 text-red-500 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <h3 className="text-base font-bold text-red-900 dark:text-red-200 mb-2">
              {t("report.list.errorTitle", "Failed to load reports")}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {listError}
            </p>
            <button
              onClick={loadReports}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#161b22] border border-red-200 dark:border-red-500/25 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.25} />
              {t("report.list.tryAgain", "Try again")}
            </button>
          </motion.div>
        )}

        {/* Empty state — no reports at all */}
        {!listLoading && !listError && reports.length === 0 && (
          <EmptyState />
        )}

        {/* Empty state — filters applied but no results */}
        {!listLoading &&
          !listError &&
          reports.length > 0 &&
          filteredReports.length === 0 && (
            <FilteredEmptyState
              onClear={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
            />
          )}

        {/* Report list */}
        {!listError && filteredReports.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDelete={handleDeleteRequest}
                  deleting={deletingId === report.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PAGINATION
        ══════════════════════════════════════════════════════════ */}
        {pagination && pagination.totalPages > 1 && filteredReports.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-[#7d8590] tabular-nums">
              {t("report.list.pagination.showing", "Showing {{from}}–{{to}} of {{total}}", {
                from: page * PAGE_SIZE + 1,
                to: Math.min((page + 1) * PAGE_SIZE, pagination.totalElements ?? filteredReports.length),
                total: pagination.totalElements ?? filteredReports.length,
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canGoBack || listLoading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.25} />
                {t("report.list.pagination.prev", "Previous")}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!canGoForward || listLoading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("report.list.pagination.next", "Next")}
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL (inline for now)
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {reportToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] shadow-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    strokeWidth={2.25}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
                    {t("report.list.deleteModal.title", "Delete this report?")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-[#c9d1d9] leading-relaxed">
                    {t(
                      "report.list.deleteModal.body",
                      "This will permanently delete “{{title}}” and all its sections. This action cannot be undone.",
                      {
                        title:
                          reportToDelete.title ||
                          t("report.card.untitled", "Due Diligence Report"),
                      }
                    )}
                  </p>
                </div>
              </div>

              <label className="block mb-5">
                <span className="block text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2">
                  {t(
                    "report.list.deleteModal.confirmPrompt",
                    "Type DELETE to confirm"
                  )}
                </span>
                <input
                  type="text"
                  autoFocus
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-[#e6edf3] placeholder:text-gray-400 dark:placeholder:text-[#6e7681] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors font-mono"
                />
              </label>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={
                    deleteConfirmText.trim().toUpperCase() !== "DELETE"
                  }
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("report.list.deleteModal.confirm", "Delete report")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatChip({ label, value, color, pulse = false }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-1.5 h-1.5 rounded-full ${pulse ? "animate-pulse" : ""}`}
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
          {label}
        </span>
      </div>
      <div
        className="text-2xl font-black tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-dashed border-gray-300 dark:border-[#30363d] bg-gray-50/40 dark:bg-[#0d1117] p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#161b22] flex items-center justify-center mx-auto mb-5">
        <FileText
          className="w-8 h-8 text-gray-400 dark:text-[#6e7681]"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
        {t("report.list.empty.title", "No reports yet")}
      </h3>
      <p className="text-sm text-gray-500 dark:text-[#7d8590] max-w-md mx-auto mb-6 leading-relaxed">
        {t(
          "report.list.empty.body",
          "Generate your first due diligence report to see it here. Reports combine property data, risk analysis, financials, and recommendations into one comprehensive document."
        )}
      </p>
      <Link
  href="/dashboard/property-search"
  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] active:scale-[0.97]"
>
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
  <Sparkles className="w-4 h-4 relative z-10" strokeWidth={2.5} />
  <span className="relative z-10">
    {t("report.list.empty.cta", "Browse properties")}
  </span>
</Link>
    </motion.div>
  );
}

function FilteredEmptyState({ onClear }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] p-10 text-center"
    >
      <Search
        className="w-8 h-8 text-gray-300 dark:text-[#484f58] mx-auto mb-3"
        strokeWidth={1.5}
      />
      <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
        {t("report.list.filtered.title", "No reports match your filters")}
      </h3>
      <p className="text-xs text-gray-500 dark:text-[#7d8590] mb-4">
        {t(
          "report.list.filtered.body",
          "Try adjusting your search or status filter."
        )}
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors"
      >
        {t("report.list.filtered.clear", "Clear filters")}
      </button>
    </motion.div>
  );
}