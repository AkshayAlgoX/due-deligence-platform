// frontend/src/components/reports/ReportCard.jsx
"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  formatReportDateShort,
  formatVersion,
  getStatusMeta,
} from "@/utils/reportUtils";
import { getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * ReportCard — dense list item for the My Reports page.
 *
 * IMPORTANT: The whole card is a Link when completed. To avoid nested <a> tags
 * (HTML invalid + React hydration error), the kebab menu uses buttons +
 * router.push() for navigation instead of Link components.
 */
export default function ReportCard({ report, onDelete, deleting = false }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close menu on Esc
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const statusMeta = getStatusMeta(report.status);
  const isCompleted = report.status === "COMPLETED";
  const isFailed = report.status === "FAILED";
  const isInProgress =
    report.status === "PENDING" || report.status === "GENERATING";

  const hasRiskSnapshot =
    report.riskScoreSnapshot != null && report.riskLevelSnapshot != null;
  const riskMeta = hasRiskSnapshot
    ? getRiskLevelMeta(report.riskLevelSnapshot)
    : null;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (typeof onDelete === "function") {
      onDelete(report);
    }
  };

  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleOpenReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    router.push(`/reports/${report.id}`);
  };

  // ── The whole card is a Link (completed) or a div (in-progress/failed) ──
  const CardWrapper = isCompleted ? Link : "div";
  const wrapperProps = isCompleted ? { href: `/reports/${report.id}` } : {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative rounded-xl border transition-all duration-200
        ${isCompleted
          ? "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-sm"
          : isFailed
          ? "border-red-200 dark:border-red-500/25 bg-red-50/30 dark:bg-red-500/5"
          : "border-blue-200 dark:border-blue-500/25 bg-blue-50/30 dark:bg-blue-500/5"
        }
        ${deleting ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <CardWrapper
        {...wrapperProps}
        className={`block p-5 ${isCompleted ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-start gap-4">
          {/* ── Left: Status icon ── */}
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${statusMeta.color}15`,
            }}
          >
            {isInProgress && (
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: statusMeta.color }}
                strokeWidth={2}
              />
            )}
            {isCompleted && (
              <FileText
                className="w-5 h-5"
                style={{ color: statusMeta.color }}
                strokeWidth={2}
              />
            )}
            {isFailed && (
              <AlertCircle
                className="w-5 h-5"
                style={{ color: statusMeta.color }}
                strokeWidth={2}
              />
            )}
          </div>

          {/* ── Middle: Content ── */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Title + version + status */}
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#e6edf3] leading-tight truncate">
                {report.title ||
                  t("report.card.untitled", "Due Diligence Report")}
              </h3>
              {report.version != null && (
                <span className="text-[11px] font-bold text-gray-400 dark:text-[#6e7681] tabular-nums flex-shrink-0">
                  {formatVersion(report.version)}
                </span>
              )}
              <span
                className={`
                  inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                  text-[10px] font-bold uppercase tracking-widest flex-shrink-0
                  ${statusMeta.bg} ${statusMeta.text} border ${statusMeta.border}
                `}
              >
                <span
                  className={`w-1 h-1 rounded-full ${statusMeta.dot} ${
                    isInProgress ? "animate-pulse" : ""
                  }`}
                />
                {t(statusMeta.labelKey, statusMeta.defaultLabel)}
              </span>
            </div>

            {/* Row 2: Property address + generated date */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-[#7d8590] mb-2.5">
              {report.propertyAddress && (
                <span className="inline-flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                  <span className="truncate max-w-[280px]">
                    {report.propertyAddress}
                  </span>
                </span>
              )}
              {report.createdAt && (
                <span className="inline-flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  {formatReportDateShort(report.createdAt)}
                </span>
              )}
            </div>

            {/* Row 3: Meta chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {hasRiskSnapshot && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums"
                  style={{
                    backgroundColor: `${riskMeta.solid}15`,
                    color: riskMeta.solid,
                  }}
                >
                  <Activity className="w-3 h-3" strokeWidth={2.25} />
                  {t("report.card.risk", "Risk")}{" "}
                  {Number(report.riskScoreSnapshot).toFixed(1)}
                </span>
              )}
              {report.sectionCount != null && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-gray-600 dark:text-[#c9d1d9] bg-gray-100 dark:bg-[#21262d]">
                  <FileText className="w-3 h-3" strokeWidth={2.25} />
                  {t("report.card.sections", "{{count}} sections", {
                    count: report.sectionCount,
                  })}
                </span>
              )}
              {isFailed && report.errorMessage && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15 max-w-[300px] truncate"
                  title={report.errorMessage}
                >
                  <AlertCircle
                    className="w-3 h-3 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <span className="truncate">{report.errorMessage}</span>
                </span>
              )}
            </div>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCompleted && (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-[#7d8590] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3] transition-colors">
                {t("report.card.view", "View")}
                <ArrowRight
                  className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </div>
            )}

            {/* Kebab menu — uses buttons only to avoid nested <a> tags */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={handleMenuToggle}
                aria-label={t("report.card.moreActions", "More actions")}
                aria-expanded={menuOpen}
                className="p-1.5 rounded-lg text-gray-400 dark:text-[#6e7681] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2.25} />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 z-20 w-48 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-lg overflow-hidden"
                >
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={handleOpenReport}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors text-left"
                    >
                      <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                      {t("report.card.openReport", "Open report")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {t("report.card.delete", "Delete report")}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
}