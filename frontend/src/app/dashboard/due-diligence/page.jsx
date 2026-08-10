"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Download,
  Building2,
  Zap,
  FileWarning,
  ArrowDownUp,
  Sparkles,
  Info,
  Plus,
  FileSpreadsheet,
} from "lucide-react";

import { getAllProperties } from "@/services/propertyService";
import { useReport } from "@/hooks/useReport";

// ─── Design tokens ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  COMPLETED:   { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)",  label: "Completed"   },
  PROCESSING:  { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", label: "Processing"  },
  PENDING:     { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", label: "Pending"     },
  FAILED:      { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  label: "Failed"      },
  EXPIRED:     { color: "#6B7280", bg: "rgba(107,114,128,0.12)",border: "rgba(107,114,128,0.25)",label: "Expired"     },
};

function normalizeStatus(s) {
  const key = (s ?? "").toUpperCase();
  return STATUS_CONFIG[key] ? key : "PENDING";
}

// ─── Route helper (SINGLE SOURCE OF TRUTH) ────────────────────────────────────

const PROPERTY_DETAIL_ROUTE = (id) => `/dashboard/property-search/${id}`;
const REPORT_DETAIL_ROUTE   = (id) => `/reports/${id}`;
const ALL_REPORTS_ROUTE     = "/reports";

// ─── Animated number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, style, className }) {
  const ref = useRef(null);
  const mv  = useMotionValue(0);
  const sp  = useSpring(mv, { stiffness: 60, damping: 20 });

  useEffect(() => {
    mv.jump(0);
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = sp.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = decimals > 0 ? v.toFixed(decimals) : Math.round(v);
      }
    });
    return unsub;
  }, [sp, decimals]);

  return <span ref={ref} style={style} className={className}>0</span>;
}

// ─── Info tooltip ─────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={13} className="text-gray-400 dark:text-[#6e7681] cursor-help" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 11,
              lineHeight: 1.5,
              color: "#e6edf3",
              width: 240,
              fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      borderRadius: 99, fontWeight: 700,
      fontSize: size === "xs" ? 10 : 11,
      padding: size === "xs" ? "2px 8px" : "3px 10px",
      letterSpacing: "0.04em", textTransform: "uppercase",
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.color, display: "inline-block", flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

// ─── Format badge ─────────────────────────────────────────────────────────────

function FormatBadge({ format }) {
  const f = (format ?? "").toUpperCase();
  if (f === "PDF") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 10, fontWeight: 800, padding: "2px 6px",
        background: "rgba(239,68,68,0.12)",
        color: "#EF4444",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 5, letterSpacing: "0.05em",
      }}>
        <FileText size={9} strokeWidth={2.5} />
        PDF
      </span>
    );
  }
  if (f === "EXCEL" || f === "XLSX") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 10, fontWeight: 800, padding: "2px 6px",
        background: "rgba(34,197,94,0.12)",
        color: "#22C55E",
        border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: 5, letterSpacing: "0.05em",
      }}>
        <FileSpreadsheet size={9} strokeWidth={2.5} />
        EXCEL
      </span>
    );
  }
  // If format missing/unknown, render nothing
  return null;
}
// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ percent, size = 140, color = "#22C55E" }) {
  const r      = (size - 20) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: `drop-shadow(0 0 8px ${color}50)`,
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <AnimatedNumber
            value={percent}
            decimals={0}
            style={{ fontSize: 30, fontWeight: 900, color, fontVariantNumeric: "tabular-nums" }}
          />
          <span style={{ fontSize: 14, fontWeight: 800, color }}>%</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color, marginTop: -2,
        }}>
          Coverage
        </span>
      </div>
    </div>
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  } catch { return "—"; }
}

function timeAgo(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "—";

  const diff = Date.now() - then;
  if (diff < 0) return formatDate(iso);

  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  // Same-day → time only
  const timeStr = new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (secs < 45)   return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hrs < 24)    return `${hrs}h ago · ${timeStr}`;
  if (days === 1)  return `yesterday · ${timeStr}`;
  if (days < 7)    return `${days}d ago · ${timeStr}`;
  return formatDate(iso);
}
// ─── CSV export ───────────────────────────────────────────────────────────────

function exportDueDiligenceCSV(properties, reports) {
  const headers = [
    "Property Address", "City", "State", "Property Type",
    "Market Value", "Report Count", "Latest Report Status",
    "Latest Report Date", "Latest Report Format", "Coverage",
  ];

  const rows = properties.map((p) => {
    const propReports = reports.filter((r) => r.propertyId === p.id);
    const latest = propReports.sort((a, b) =>
      new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
    )[0];
    return [
      `"${(p.address ?? "").replace(/"/g, '""')}"`,
      `"${(p.city ?? "").replace(/"/g, '""')}"`,
      p.state ?? "",
      p.propertyType ?? "",
      p.marketValue ?? "",
      propReports.length,
      latest ? (latest.status ?? "") : "NO_REPORT",
      latest ? (latest.completedAt ?? latest.createdAt ?? "") : "",
      latest ? (latest.format ?? "") : "",
      propReports.length > 0 ? "Yes" : "No",
    ].join(",");
  });

  const csv  = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const ts   = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `due_diligence_portfolio_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-pulse">
      <div className="h-36 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
        ))}
      </div>
      <div className="h-56 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      <div className="h-64 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
    </div>
  );
}

// ─── Filter constants ─────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: "ALL",         label: "All",           icon: FileText },
  { id: "COVERED",     label: "Covered",       icon: CheckCircle2 },
  { id: "NO_REPORT",   label: "Not Started",   icon: FileWarning  },
];

const SORT_OPTIONS = [
  { value: "recent",       label: "Recent Activity" },
  { value: "name_asc",     label: "Name A→Z"        },
  { value: "reports_desc", label: "Most Reports"    },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DueDiligencePortfolioPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tableRef = useRef(null);

  const {
    reports,
    pagination,
    listLoading,
    listError,
    fetchList,
  } = useReport();

  const [properties, setProperties]     = useState([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [propsError, setPropsError]     = useState(null);
  const [filterTab, setFilterTab]       = useState("ALL");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState("recent");

  useEffect(() => {
    document.title = "Due Diligence | Real Estate Due Diligence";
  }, []);

  // Load properties
  useEffect(() => {
    (async () => {
      try {
        setPropsLoading(true);
        setPropsError(null);
        const props = await getAllProperties();
        setProperties(props ?? []);
      } catch (err) {
        setPropsError(err?.message ?? "Failed to load properties.");
      } finally {
        setPropsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    fetchList({ page: 0, size: 200, sort: "createdAt,desc" });
  }, [fetchList]);

  const loading = propsLoading || listLoading;
  const error   = propsError || listError;

  // Navigation helpers — used everywhere to prevent 404s
  const goToProperty = useCallback((id) => {
    if (id != null) router.push(PROPERTY_DETAIL_ROUTE(id));
  }, [router]);

  const goToReport = useCallback((id) => {
    if (id != null) router.push(REPORT_DETAIL_ROUTE(id));
  }, [router]);

  const scrollToTable = useCallback(() => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const jumpToNoReport = useCallback(() => {
    setFilterTab("NO_REPORT");
    setSearchQuery("");
    scrollToTable();
  }, [scrollToTable]);

  // ── Derived ──

  const reportsByProperty = useMemo(() => {
    const map = {};
    (reports ?? []).forEach((r) => {
      if (!r.propertyId) return;
      if (!map[r.propertyId]) map[r.propertyId] = [];
      map[r.propertyId].push(r);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    );
    return map;
  }, [reports]);

  const enriched = useMemo(() => {
    return properties.map((p) => {
      const propReports = reportsByProperty[p.id] ?? [];
      const latest      = propReports[0] ?? null;
      const latestStatus = latest ? normalizeStatus(latest.status) : null;
      return {
        ...p,
        reports: propReports,
        reportCount: propReports.length,
        latestReport: latest,
        latestStatus,
        hasReports: propReports.length > 0,
      };
    });
  }, [properties, reportsByProperty]);

  const stats = useMemo(() => {
    const total = properties.length;
    const covered = enriched.filter((p) => p.hasReports).length;
    const noReport = total - covered;
    const totalReports = reports?.length ?? 0;
    const completedReports = (reports ?? []).filter((r) => normalizeStatus(r.status) === "COMPLETED").length;
    const pendingReports   = (reports ?? []).filter((r) => {
      const s = normalizeStatus(r.status);
      return s === "PROCESSING" || s === "PENDING";
    }).length;
    const coverage = total > 0 ? Math.round((covered / total) * 100) : 0;
    return { total, covered, noReport, totalReports, completedReports, pendingReports, coverage };
  }, [properties, enriched, reports]);

  const recentReports = useMemo(() => {
    return (reports ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 5);
  }, [reports]);

  const filtered = useMemo(() => {
    let list = [...enriched];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) =>
        (p.address ?? "").toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        (p.propertyType ?? "").toLowerCase().includes(q)
      );
    }

    if (filterTab === "COVERED")   list = list.filter((p) => p.hasReports);
    if (filterTab === "NO_REPORT") list = list.filter((p) => !p.hasReports);

    switch (sortBy) {
      case "recent":
        list.sort((a, b) =>
          new Date(b.latestReport?.createdAt ?? 0) - new Date(a.latestReport?.createdAt ?? 0)
        );
        break;
      case "name_asc":
        list.sort((a, b) => (a.address ?? "").localeCompare(b.address ?? ""));
        break;
      case "reports_desc":
        list.sort((a, b) => b.reportCount - a.reportCount);
        break;
      default: break;
    }
    return list;
  }, [enriched, filterTab, searchQuery, sortBy]);

  const noReportProperties = useMemo(() =>
    enriched.filter((p) => !p.hasReports).slice(0, 5),
  [enriched]);

  const hasActiveFilters = filterTab !== "ALL" || searchQuery.trim();

  const clearFilters = () => {
    setFilterTab("ALL");
    setSearchQuery("");
  };

  // ── Render ──

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-10 text-center">
          <AlertTriangle size={40} className="mx-auto mb-3 text-red-500" />
          <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const coverageColor =
    stats.coverage >= 75 ? "#22C55E" :
    stats.coverage >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-10">

      {/* ══════════════ HERO ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 dark:border-[#30363d]
          bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
      >
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, #EF4444, #F59E0B, #22C55E)",
        }} />

        <div className="p-6 flex flex-col md:flex-row items-center gap-8">
          <ProgressRing percent={stats.coverage} color={coverageColor} />

          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
              Due Diligence Overview
            </h1>
              <div className="text-sm text-gray-500 dark:text-[#7d8590] mb-4 flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span>
                {stats.covered} of {stats.total} properties have due diligence reports
              </span>
              <InfoTooltip
                text="Coverage = properties with at least one report generated ÷ total properties. Aim for 100% coverage to reduce transaction risk."
              />
              </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-3 bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d]">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, marginBottom: 6,
                  background: "rgba(34,197,94,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircle2 size={15} color="#22C55E" strokeWidth={2.5} />
                </div>
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {stats.completedReports}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E]">
                  Completed
                </p>
              </div>

              <div className="rounded-xl p-3 bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d]">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, marginBottom: 6,
                  background: "rgba(59,130,246,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Clock size={15} color="#3B82F6" strokeWidth={2.5} />
                </div>
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {stats.pendingReports}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
                  In Progress
                </p>
              </div>

              <div className="rounded-xl p-3 bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d]">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, marginBottom: 6,
                  background: "rgba(245,158,11,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileWarning size={15} color="#F59E0B" strokeWidth={2.5} />
                </div>
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {stats.noReport}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                  No Report
                </p>
              </div>

              <div className="rounded-xl p-3 bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d]">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, marginBottom: 6,
                  background: "rgba(99,102,241,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={15} color="#6366F1" strokeWidth={2.5} />
                </div>
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {stats.totalReports}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1]">
                  Total
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(ALL_REPORTS_ROUTE)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold
                bg-gradient-to-br from-[#22C55E] to-[#16a34a]
                text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)]
                hover:shadow-[0_12px_36px_rgba(34,197,94,0.5)]
                transition"
            >
              <FileText size={16} />
              View All Reports
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => exportDueDiligenceCSV(properties, reports ?? [])}
              disabled={properties.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
                bg-white dark:bg-[#1c2128]
                border border-gray-200 dark:border-[#30363d]
                text-gray-700 dark:text-[#e6edf3]
                hover:border-gray-300 dark:hover:border-[#484f58]
                transition shadow-sm disabled:opacity-50"
            >
              <Download size={15} />
              Export CSV
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ ACTION NEEDED ══════════════ */}
      {noReportProperties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(245,158,11,0.2)",
            background: "linear-gradient(135deg, rgba(245,158,11,0.04), transparent)",
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(245,158,11,0.15)",
                  boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Zap size={19} color="#F59E0B" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-[#e6edf3]">
                    Action Needed
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {stats.noReport} propert{stats.noReport === 1 ? "y has" : "ies have"} no due diligence report yet
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {noReportProperties.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl
                    bg-white dark:bg-[#161b22]
                    border border-gray-100 dark:border-[#30363d]
                    hover:border-gray-200 dark:hover:border-[#484f58]
                    hover:shadow-md transition text-left group"
                  style={{ borderLeft: "3px solid #F59E0B" }}
                >
                  <button
                    onClick={() => goToProperty(p.id)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: "rgba(245,158,11,0.12)",
                      boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Building2 size={18} color="#F59E0B" strokeWidth={2.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate group-hover:text-[#F59E0B] transition">
                        {p.address}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7d8590] truncate">
                        {p.city}{p.state ? `, ${p.state}` : ""} · {p.propertyType ?? "—"}
                      </p>
                    </div>
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={(e) => { e.stopPropagation(); goToProperty(p.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                      bg-gradient-to-br from-[#F59E0B] to-[#D97706]
                      text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]
                      hover:shadow-[0_6px_16px_rgba(245,158,11,0.5)]
                      transition whitespace-nowrap"
                  >
                    <Plus size={13} strokeWidth={2.75} />
                    Generate Report
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {stats.noReport > noReportProperties.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={jumpToNoReport}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B] hover:underline"
                >
                  View all {stats.noReport} properties without reports
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ══════════════ RECENT REPORTS ══════════════ */}
      {recentReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 p-6 border-b border-gray-100 dark:border-[#21262d]">
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(34,197,94,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={17} color="#22C55E" strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">
                  Recent Reports
                </p>
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  Last {recentReports.length} generated
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(ALL_REPORTS_ROUTE)}
              className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-[#21262d]">
            {recentReports.map((r, i) => {
              const status  = normalizeStatus(r.status);
              const cfg     = STATUS_CONFIG[status];
              const prop    = properties.find((p) => p.id === r.propertyId);
              return (
                <motion.button
                  key={r.id ?? i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  whileTap={{ scale: 0.997 }}
                  onClick={() => goToReport(r.id)}
                  className="w-full flex items-center gap-4 px-6 py-3.5
                    hover:bg-gray-50/80 dark:hover:bg-[#1c2128]/60
                    transition text-left group"
                  style={{ borderLeft: `3px solid ${cfg.color}` }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: cfg.bg,
                    boxShadow: `inset 0 0 0 1px ${cfg.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color={cfg.color} strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate">
                      {prop?.address ?? `Property #${r.propertyId ?? "—"}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <FormatBadge format={r.format} />
                      <span className="text-xs text-gray-500 dark:text-[#7d8590]">
                        {timeAgo(r.completedAt ?? r.createdAt)}
                      </span>
                    </div>
                  </div>
                  <StatusPill status={status} size="xs" />
                  <ArrowUpRight size={16} className="text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] transition flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════ ALL PROPERTIES TABLE ══════════════ */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden scroll-mt-6"
      >
        <div className="p-6 border-b border-gray-100 dark:border-[#21262d] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(99,102,241,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Filter size={16} color="#6366F1" strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">
                  Property Coverage
                </p>
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  {filtered.length} shown
                  {filterTab === "COVERED"   && " · Covered only"}
                  {filterTab === "NO_REPORT" && " · Not started only"}
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                  bg-gray-100 dark:bg-[#1c2128]
                  text-gray-600 dark:text-[#7d8590]
                  hover:bg-gray-200 dark:hover:bg-[#30363d]
                  transition"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const Icon   = tab.icon;
              const active = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? "bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117] shadow-sm"
                      : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#7d8590] hover:bg-gray-200 dark:hover:bg-[#30363d]"
                  }`}
                >
                  <Icon size={13} strokeWidth={2.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search property by address, city, type…"
                autoComplete="off"
                spellCheck={false}
                className="w-full pl-9 pr-9 py-2 rounded-xl text-sm
                  bg-gray-50 dark:bg-[#1c2128]
                  border border-gray-200 dark:border-[#30363d]
                  text-gray-900 dark:text-[#e6edf3]
                  placeholder:text-gray-400 dark:placeholder:text-[#6e7681]
                  focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]/40
                  transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#1c2128]
              border border-gray-200 dark:border-[#30363d]">
              <ArrowDownUp size={13} className="text-gray-400 dark:text-[#6e7681] ml-2 mr-1 flex-shrink-0" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    sortBy === opt.value
                      ? "bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] shadow-sm"
                      : "text-gray-500 dark:text-[#7d8590] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-[#21262d] bg-gray-50/50 dark:bg-[#0d1117]/40">
          <span className="w-9 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]" />
          <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">Property</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center" style={{ width: 70 }}>Reports</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]" style={{ width: 130 }}>Latest</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center" style={{ width: 110 }}>Status</span>
          <span style={{ width: 16 }} />
        </div>

        <div className="divide-y divide-gray-50 dark:divide-[#21262d]">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <ShieldCheck size={36} className="mx-auto mb-3 text-gray-300 dark:text-[#30363d]" />
                <p className="text-gray-500 dark:text-[#7d8590] font-medium text-sm">
                  No properties match the current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs font-bold text-[#22C55E] hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              filtered.map((p, i) => {
                const status = p.latestStatus;
                const cfg    = status ? STATUS_CONFIG[status] : null;
                const accent = cfg?.color ?? "#6B7280";
                return (
                  <motion.button
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    whileTap={{ scale: 0.997 }}
                    onClick={() => goToProperty(p.id)}
                    className="w-full flex items-center gap-4 px-6 py-4
                      hover:bg-gray-50/80 dark:hover:bg-[#1c2128]/60
                      transition text-left group"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: p.hasReports ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                      boxShadow: `inset 0 0 0 1px ${p.hasReports ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {p.hasReports
                        ? <ShieldCheck size={16} color="#22C55E" strokeWidth={2.25} />
                        : <FileWarning size={16} color="#F59E0B" strokeWidth={2.25} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate group-hover:text-[#22C55E] transition">
                        {p.address}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-[#7d8590]">
                          {p.city}{p.state ? `, ${p.state}` : ""}
                        </span>
                        {p.propertyType && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                            bg-gray-100 dark:bg-[#21262d]
                            text-gray-500 dark:text-[#7d8590] uppercase tracking-wide">
                            {p.propertyType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ width: 70, textAlign: "center" }}>
                      <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                        {p.reportCount}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
                        {p.reportCount === 1 ? "report" : "reports"}
                      </p>
                    </div>

                    <div style={{ width: 130 }}>
                      {p.latestReport ? (
                        <>
                          <p className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
                            {timeAgo(p.latestReport.completedAt ?? p.latestReport.createdAt)}
                          </p>
                          <div className="mt-1">
                            <FormatBadge format={p.latestReport.format} />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-[#6e7681] italic">
                          Never generated
                        </p>
                      )}
                    </div>

                    <div style={{ width: 110, display: "flex", justifyContent: "center" }}>
                      {status ? (
                        <StatusPill status={status} size="xs" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{
                            background: "rgba(107,114,128,0.12)",
                            color: "#6B7280",
                            border: "1px solid rgba(107,114,128,0.25)",
                          }}
                        >
                          None
                        </span>
                      )}
                    </div>

                    <ArrowUpRight size={16} className="text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] transition flex-shrink-0" />
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}