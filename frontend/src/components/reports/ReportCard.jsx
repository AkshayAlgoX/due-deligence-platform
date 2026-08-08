// frontend/src/components/reports/ReportCard.jsx
"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Copy,
  FileText,
  Link2,
  Loader2,
  MapPin,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  formatReportDateShort,
  formatVersion,
  getStatusMeta,
} from "@/utils/reportUtils";
import { getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * ReportCard — dense list item for the My Reports page.
 *
 * Design principles (Linear / Vercel / Notion tier):
 *  - Entire card is the click target (no redundant "View" button)
 *  - Kebab menu contains ONLY secondary actions (Copy Link, Copy ID, Delete)
 *  - stopPropagation() on kebab prevents double navigation
 *  - Hover reveals ArrowUpRight indicator (subtle "navigate away" hint)
 *  - Kebab uses buttons + router.push (never nested <a>)
 *  - Kebab dropdown is portaled to document.body to escape stacking contexts
 *    created by parent hover transforms (Session 22 fix)
 */
export default function ReportCard({ report, onDelete, deleting = false }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu on outside click — checks BOTH button and portal menu
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      const clickedButton = buttonRef.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);
      if (!clickedButton && !clickedMenu) {
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

  // Calculate portal position based on button location
  useLayoutEffect(() => {
    if (!menuOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_WIDTH = 208; // w-52 = 13rem = 208px
    setMenuPos({
      top: rect.bottom + 6, // 6px gap below button
      left: rect.right - MENU_WIDTH, // right-align to button
    });
  }, [menuOpen]);

  // Reposition on scroll / resize while menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const reposition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const MENU_WIDTH = 208;
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.right - MENU_WIDTH,
      });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
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

  // ── Kebab action handlers ──────────────────────────────────
  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const url = `${window.location.origin}/reports/${report.id}`;
      navigator.clipboard.writeText(url);
      toast.success(t("report.card.linkCopied", "Link copied to clipboard"));
    } catch (err) {
      console.error("Copy link failed:", err);
      toast.error(t("report.card.copyFailed", "Failed to copy"));
    }
  };

  const handleCopyId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    try {
      navigator.clipboard.writeText(String(report.id));
      toast.success(t("report.card.idCopied", "Report ID copied"));
    } catch (err) {
      console.error("Copy ID failed:", err);
      toast.error(t("report.card.copyFailed", "Failed to copy"));
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (typeof onDelete === "function") {
      onDelete(report);
    }
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
          ? "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-gray-300 dark:hover:border-[#484f58] hover:shadow-sm hover:-translate-y-[1px]"
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

          {/* ── Right: Hover indicator + Kebab ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Subtle "navigate away" indicator — Linear/Vercel pattern */}
            {isCompleted && (
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1"
                aria-hidden="true"
              >
                <ArrowUpRight
                  className="w-4 h-4 text-gray-400 dark:text-[#7d8590]"
                  strokeWidth={2.25}
                />
              </div>
            )}

            {/* Kebab menu — button stays here, dropdown portaled to body */}
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={handleMenuToggle}
                aria-label={t("report.card.moreActions", "More actions")}
                aria-expanded={menuOpen}
                className="p-1.5 rounded-lg text-gray-400 dark:text-[#6e7681] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2.25} />
              </button>

              {/* Portaled dropdown — escapes parent stacking contexts */}
              {menuOpen && typeof window !== "undefined" && createPortal(
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: "fixed",
                    top: menuPos.top,
                    left: menuPos.left,
                  }}
                  className="z-[9999] w-52 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-xl overflow-hidden py-1"
                >
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2129] transition-colors text-left"
                  >
                    <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {t("report.card.copyLink", "Copy link")}
                  </button>

                  {/* Copy Report ID */}
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2129] transition-colors text-left"
                  >
                    <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                    {t("report.card.copyId", "Copy report ID")}
                  </button>

                  {/* Divider */}
                  <div className="my-1 h-px bg-gray-100 dark:bg-[#30363d]" />

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {t("report.card.delete", "Delete report")}
                  </button>
                </motion.div>,
                document.body
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
}