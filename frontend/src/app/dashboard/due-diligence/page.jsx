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
  FileWarning,
  ArrowDownUp,
  Info,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getAllProperties } from "@/services/propertyService";
import { useReport } from "@/hooks/useReport";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  COMPLETED:  { color: "#22C55E", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",  label: "Completed"  },
  PROCESSING: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)", label: "Processing" },
  PENDING:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)", label: "Pending"    },
  FAILED:     { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",  label: "Failed"     },
  EXPIRED:    { color: "#6B7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)",label: "Expired"    },
};

const PROPERTY_DETAIL_ROUTE = (id) => `/dashboard/property-search/${id}`;
const REPORT_DETAIL_ROUTE   = (id) => `/reports/${id}`;
const ALL_REPORTS_ROUTE     = "/reports";

function normalizeStatus(s) {
  const k = (s ?? "").toUpperCase();
  return STATUS_CONFIG[k] ? k : "PENDING";
}

// ─── Theme detection ──────────────────────────────────────────────────────────

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// ─── Animated number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, style, className }) {
  const ref = useRef(null);
  const mv  = useMotionValue(0);
  const sp  = useSpring(mv, { stiffness: 60, damping: 20 });
  useEffect(() => { mv.jump(0); mv.set(value); }, [value, mv]);
  useEffect(() => {
    const unsub = sp.on("change", (v) => {
      if (ref.current) ref.current.textContent = decimals > 0 ? v.toFixed(decimals) : Math.round(v);
    });
    return unsub;
  }, [sp, decimals]);
  return <span ref={ref} style={style} className={className}>0</span>;
}

// ─── Info tooltip ─────────────────────────────────────────────────────────────

function InfoTooltip({ text, isDark }) {
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
              background: isDark ? "#161b22" : "#ffffff",
              border: `1px solid ${isDark ? "#30363d" : "#e2e8f0"}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 11,
              lineHeight: 1.5,
              color: isDark ? "#e6edf3" : "#0f172a",
              width: 240,
              fontWeight: 500,
              boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(15,23,42,0.12)",
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

// ─── Format inline label ─────────────────────────────────────────────────────

function FormatBadge({ format }) {
  const f = (format ?? "").toUpperCase();
  if (f === "PDF") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 dark:text-red-400">
        <FileText size={9} strokeWidth={2.5} />PDF
      </span>
    );
  }
  if (f === "EXCEL" || f === "XLSX") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
        <FileSpreadsheet size={9} strokeWidth={2.5} />EXCEL
      </span>
    );
  }
  return null;
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
  const timeStr = new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (secs < 45)  return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hrs < 24)   return `${hrs}h ago · ${timeStr}`;
  if (days === 1) return `yesterday · ${timeStr}`;
  if (days < 7)   return `${days}d ago · ${timeStr}`;
  return formatDate(iso);
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(properties, reports) {
  const headers = [
    "Property Address","City","State","Property Type","Market Value",
    "Report Count","Latest Status","Latest Date","Latest Format","Coverage",
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
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const ts = new Date().toISOString().split("T")[0];
  const { downloadBlob } = await import("@/utils/downloadUtils");
  downloadBlob(blob, `due_diligence_portfolio_${ts}.csv`);
}

// ─── Activity chart data ──────────────────────────────────────────────────────

function buildActivityData(reports) {
  const now = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ date: d, count: 0, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
  }
  (reports ?? []).forEach((r) => {
    const t = new Date(r.createdAt ?? 0).getTime();
    if (isNaN(t)) return;
    const bucket = days.find((d) => {
      const start = d.date.getTime();
      const end   = start + 86400000;
      return t >= start && t < end;
    });
    if (bucket) bucket.count++;
  });
  return days;
}

const ActivityTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: isDark ? "#161b22" : "#ffffff",
      border: `1px solid ${isDark ? "#30363d" : "#e2e8f0"}`,
      borderRadius: 8, padding: "6px 10px",
      boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,23,42,0.1)",
    }}>
      <p style={{ color: isDark ? "#e6edf3" : "#0f172a", fontSize: 11, fontWeight: 700 }}>
        {d.label}
      </p>
      <p style={{ color: "#22C55E", fontSize: 11, fontWeight: 600 }}>
        {d.count} report{d.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
        <div className="h-56 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      </div>
      <div className="h-96 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: "ALL",       label: "All",         icon: FileText   },
  { id: "COVERED",   label: "Covered",     icon: CheckCircle2 },
  { id: "NO_REPORT", label: "Not Started", icon: FileWarning  },
];

const SORT_OPTIONS = [
  { value: "recent",       label: "Recent"     },
  { value: "name_asc",     label: "Name"       },
  { value: "reports_desc", label: "Coverage"   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DueDiligencePortfolioPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isDark = useIsDark();
  const tableRef = useRef(null);

  const { reports, listLoading, listError, fetchList } = useReport();

  const [properties, setProperties]     = useState([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [propsError, setPropsError]     = useState(null);
  const [filterTab, setFilterTab]       = useState("ALL");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState("recent");
  const [expandedCities, setExpandedCities] = useState({});

  useEffect(() => {
    document.title = "Due Diligence | Real Estate Due Diligence";
  }, []);

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

  // ── Derived data ──

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
        ...p, reports: propReports, reportCount: propReports.length,
        latestReport: latest, latestStatus,
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

  // Group unassessed properties by city
  const unassessedByCity = useMemo(() => {
    const groups = {};
    enriched.filter((p) => !p.hasReports).forEach((p) => {
      const city = (p.city ?? "Unknown").trim() || "Unknown";
      if (!groups[city]) groups[city] = [];
      groups[city].push(p);
    });
    return Object.entries(groups)
      .map(([city, list]) => ({ city, list }))
      .sort((a, b) => b.list.length - a.list.length);
  }, [enriched]);

  const recentReports = useMemo(() => {
    return (reports ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 5);
  }, [reports]);

  const activityData = useMemo(() => buildActivityData(reports), [reports]);

  const peakDay = useMemo(() => {
    return activityData.reduce((peak, d) => d.count > peak.count ? d : peak, { count: 0 });
  }, [activityData]);

  const totalIn30Days = useMemo(() =>
    activityData.reduce((sum, d) => sum + d.count, 0),
  [activityData]);

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

  const hasActiveFilters = filterTab !== "ALL" || searchQuery.trim();
  const clearFilters = () => { setFilterTab("ALL"); setSearchQuery(""); };

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

  // Coverage color story: red < 40 < amber < 75 < green
  const coverageColor =
    stats.coverage >= 75 ? "#22C55E" :
    stats.coverage >= 40 ? "#F59E0B" : "#EF4444";

  const coverageMessage =
    stats.coverage >= 75 ? "Portfolio is well-vetted."     :
    stats.coverage >= 40 ? "More coverage recommended."    :
    "Significant compliance gap.";

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-10">

      {/* ══════════════ HERO — Compact & Data-Dense ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 dark:border-[#30363d]
          bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
      >
        <div className="p-8 flex flex-col lg:flex-row items-stretch gap-8">

          {/* Left — Coverage + Message */}
          <div className="flex items-center gap-5 lg:pr-6 lg:border-r lg:border-gray-100 lg:dark:border-[#21262d]">
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={60} cy={60} r={52} fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"} strokeWidth={9} />
                <circle cx={60} cy={60} r={52} fill="none"
                  stroke={coverageColor} strokeWidth={9} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 - (stats.coverage / 100) * 2 * Math.PI * 52}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <AnimatedNumber
                    value={stats.coverage}
                    style={{ fontSize: 30, fontWeight: 900, color: coverageColor, fontVariantNumeric: "tabular-nums" }}
                  />
                  <span style={{ fontSize: 16, fontWeight: 800, color: coverageColor }}>%</span>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] leading-tight">
                Due Diligence
              </h1>
              <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-1">
                {coverageMessage}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-500 dark:text-[#7d8590]">
                  <span className="font-bold text-gray-900 dark:text-[#e6edf3] tabular-nums">
                    {stats.covered}
                  </span>
                  /{stats.total} covered
                </span>
                <InfoTooltip
                  isDark={isDark}
                  text="Coverage = properties with at least one report ÷ total properties."
                />
              </div>
            </div>
          </div>

          {/* Center — KPIs (data-dense, no icon tiles) */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
                Total Reports
              </p>
              <p className="text-3xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3] mt-1">
                {stats.totalReports}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-[#7d8590] mt-0.5">
                <span className="text-[#22C55E]">{stats.completedReports} done</span>
                {stats.pendingReports > 0 && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="text-[#3B82F6]">{stats.pendingReports} in progress</span>
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
                No Report
              </p>
              <p className="text-3xl font-black tabular-nums text-[#F59E0B] mt-1">
                {stats.noReport}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-[#7d8590] mt-0.5">
                across {unassessedByCity.length} cit{unassessedByCity.length === 1 ? "y" : "ies"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
                Last 30 Days
              </p>
              <p className="text-3xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3] mt-1">
                {totalIn30Days}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-[#7d8590] mt-0.5 flex items-center gap-1">
                <TrendingUp size={11} className="text-[#22C55E]" />
                reports generated
              </p>
            </div>
          </div>

          {/* Right — Single primary action */}
          <div className="flex items-center gap-2 lg:border-l lg:border-gray-100 lg:dark:border-[#21262d] lg:pl-6">
            <button
              onClick={() => exportCSV(properties, reports ?? [])}
              disabled={properties.length === 0}
              className="p-3 rounded-lg text-xs font-semibold
                bg-gray-100 dark:bg-[#1c2128]
                border border-gray-200 dark:border-[#30363d]
                text-gray-600 dark:text-[#7d8590]
                hover:bg-gray-200 dark:hover:bg-[#30363d]
                hover:text-gray-900 dark:hover:text-[#e6edf3]
                transition disabled:opacity-50"
              title="Export portfolio as CSV"
            >
              <Download size={15} />
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(ALL_REPORTS_ROUTE)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold
                bg-gray-900 dark:bg-[#e6edf3]
                text-white dark:text-[#0d1117]
                hover:bg-gray-800 dark:hover:bg-white
                transition shadow-sm whitespace-nowrap"
            >
              All Reports
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ ACTIVITY + RECENT ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Activity chart — takes 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-[#30363d]
            bg-white dark:bg-[#161b22] shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                Report Activity
              </p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                Last 30 days · Peak: {peakDay.count > 0 ? `${peakDay.count} on ${peakDay.label}` : "no activity"}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: isDark ? "#6e7681" : "#94a3b8" }}
                axisLine={false} tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: isDark ? "#6e7681" : "#94a3b8" }}
                axisLine={false} tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ActivityTooltip isDark={isDark} />} cursor={{ stroke: "#22C55E", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#activityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent reports — takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-[#30363d]
            bg-white dark:bg-[#161b22] shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#21262d]">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                Recent Reports
              </p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                {recentReports.length > 0 ? `Last ${recentReports.length} generated` : "No reports yet"}
              </p>
            </div>
            {recentReports.length > 0 && (
              <button
                onClick={() => router.push(ALL_REPORTS_ROUTE)}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:text-[#7d8590] dark:hover:text-[#e6edf3] transition flex items-center gap-1"
              >
                All
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="flex-1">
            {recentReports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={28} className="mx-auto mb-2 text-gray-300 dark:text-[#30363d]" />
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  Generate your first report from any property.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-[#21262d]">
                {recentReports.map((r, i) => {
                  const status = normalizeStatus(r.status);
                  const cfg    = STATUS_CONFIG[status];
                  const prop   = properties.find((p) => p.id === r.propertyId);
                  return (
                    <motion.button
                      key={r.id ?? i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      onClick={() => goToReport(r.id)}
                      className="w-full flex items-center gap-3 px-6 py-4
                        hover:bg-gray-50 dark:hover:bg-[#1c2128]
                        transition text-left group"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: cfg.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate group-hover:text-[#22C55E] transition">
                          {prop?.address ?? `Property #${r.propertyId ?? "—"}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <FormatBadge format={r.format} />
                          <span className="text-[10px] text-gray-500 dark:text-[#7d8590]">
                            {timeAgo(r.completedAt ?? r.createdAt)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-gray-300 dark:text-[#484f58] group-hover:text-gray-500 dark:group-hover:text-[#7d8590] transition flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ══════════════ COMPLIANCE GAP (grouped by city) ══════════════ */}
      {unassessedByCity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 dark:border-[#30363d]
            bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#21262d]">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full" style={{ background: "#F59E0B" }} />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                  Compliance Gap
                </p>
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  {stats.noReport} properties need reports · Grouped by location
                </p>
              </div>
            </div>
            <button
              onClick={() => { setFilterTab("NO_REPORT"); scrollToTable(); }}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:text-[#7d8590] dark:hover:text-[#e6edf3] transition flex items-center gap-1"
            >
              View in table
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-[#21262d]">
            {unassessedByCity.map((group, i) => {
              const isExpanded = expandedCities[group.city] ?? (i === 0);
              return (
                <div key={group.city}>
                  <button
                    onClick={() => setExpandedCities((prev) => ({ ...prev, [group.city]: !isExpanded }))}
                    className="w-full flex items-center gap-3 px-6 py-4
                      hover:bg-gray-50 dark:hover:bg-[#1c2128] transition text-left"
                  >
                    <MapPin size={14} className="text-gray-400 dark:text-[#6e7681] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
                        {group.city}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full
                      bg-amber-50 dark:bg-amber-500/10
                      text-amber-700 dark:text-amber-400 tabular-nums">
                      {group.list.length}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 dark:text-[#6e7681] transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="pb-2 px-5">
                          <div className="pl-5 border-l border-gray-100 dark:border-[#21262d] space-y-0.5">
                            {group.list.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => goToProperty(p.id)}
                                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg
                                  hover:bg-gray-50 dark:hover:bg-[#1c2128]
                                  transition text-left group"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 dark:text-[#c9d1d9] truncate group-hover:text-[#22C55E] transition">
                                    {p.address}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-[#7d8590]">
                                    {p.propertyType ?? "—"}
                                    {p.marketValue ? ` · ₹${(p.marketValue / 100000).toFixed(1)}L` : ""}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-[#6e7681] opacity-0 group-hover:opacity-100 transition">
                                  Generate →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════ FULL COVERAGE TABLE ══════════════ */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-gray-100 dark:border-[#30363d]
          bg-white dark:bg-[#161b22] shadow-sm overflow-hidden scroll-mt-6"
      >
        <div className="p-6 border-b border-gray-100 dark:border-[#21262d]">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                All Properties
              </p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}
                {filterTab === "COVERED"   && " · Covered only"}
                {filterTab === "NO_REPORT" && " · Not started only"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                    bg-gray-100 dark:bg-[#1c2128]
                    text-gray-600 dark:text-[#7d8590]
                    hover:bg-gray-200 dark:hover:bg-[#30363d]
                    transition"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
              <div className="flex items-center gap-1 flex-wrap">
                {FILTER_TABS.map((tab) => {
                  const Icon   = tab.icon;
                  const active = filterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                        active
                          ? "bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117]"
                          : "text-gray-500 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#1c2128]"
                      }`}
                    >
                      <Icon size={12} strokeWidth={2.5} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, city, or type…"
                autoComplete="off"
                spellCheck={false}
                className="w-full pl-9 pr-9 py-2 rounded-lg text-xs
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
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-[#1c2128]
              border border-gray-200 dark:border-[#30363d]">
              <ArrowDownUp size={11} className="text-gray-400 dark:text-[#6e7681] ml-2 mr-1 flex-shrink-0" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition ${
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

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[1fr_100px_150px_110px_20px] gap-3 items-center px-6 py-3
          border-b border-gray-100 dark:border-[#21262d]
          bg-gray-50/60 dark:bg-[#0d1117]/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">Property</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center">Reports</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">Latest</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center">Status</span>
          <span />
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
                <ShieldCheck size={32} className="mx-auto mb-3 text-gray-300 dark:text-[#30363d]" />
                <p className="text-gray-500 dark:text-[#7d8590] text-xs font-medium">
                  No properties match filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs font-bold text-[#22C55E] hover:underline"
                >
                  Clear
                </button>
              </motion.div>
            ) : (
              filtered.map((p, i) => (
                <motion.button
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: Math.min(i * 0.015, 0.4) }}
                  onClick={() => goToProperty(p.id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[1fr_100px_150px_110px_20px] gap-3 items-center
                    px-6 py-4
                    hover:bg-gray-50 dark:hover:bg-[#1c2128]
                    transition text-left group"
                >
                  {/* Property */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: p.hasReports ? "#22C55E" : "#F59E0B",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate group-hover:text-[#22C55E] transition">
                        {p.address}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7d8590] truncate">
                        {p.city}{p.state ? `, ${p.state}` : ""}
                        {p.propertyType && ` · ${p.propertyType}`}
                      </p>
                    </div>
                  </div>

                  {/* Reports count */}
                  <div className="md:text-center">
                    <span className="text-base font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                      {p.reportCount}
                    </span>
                    <span className="ml-1 text-[10px] text-gray-400 dark:text-[#6e7681]">
                      {p.reportCount === 1 ? "report" : "reports"}
                    </span>
                  </div>

                  {/* Latest */}
                  <div>
                    {p.latestReport ? (
                      <>
                        <p className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9]">
                          {timeAgo(p.latestReport.completedAt ?? p.latestReport.createdAt)}
                        </p>
                        <div className="mt-0.5"><FormatBadge format={p.latestReport.format} /></div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-[#6e7681] italic">
                        Never
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="md:flex md:justify-center">
                    {p.latestStatus ? (
                      <StatusPill status={p.latestStatus} size="xs" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
                        —
                      </span>
                    )}
                  </div>

                  <ChevronRight size={13} className="hidden md:block text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] transition flex-shrink-0" />
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}