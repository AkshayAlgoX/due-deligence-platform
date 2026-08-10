"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  Zap,
  ChevronRight,
  Filter,
  BarChart3,
  ArrowUpRight,
  ArrowDownUp,
  Activity,
  Building2,
  Search,
  Download,
  Info,
  X,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { getAllProperties, getPropertyRisk } from "@/services/propertyService";

// ─── Design tokens (locked) ──────────────────────────────────────────────────

const LEVEL_CONFIG = {
  LOW:      { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)",  label: "Low"      },
  MEDIUM:   { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", label: "Medium"   },
  HIGH:     { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", label: "High"     },
  CRITICAL: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  label: "Critical" },
};

const CATEGORY_CONFIG = {
  FLOOD:         { color: "#3B82F6", label: "Flood"         },
  LEGAL:         { color: "#A855F7", label: "Legal"         },
  TAX:           { color: "#F59E0B", label: "Tax"           },
  ZONING:        { color: "#6366F1", label: "Zoning"        },
  ENVIRONMENTAL: { color: "#22C55E", label: "Environmental" },
  MARKET:        { color: "#F43F5E", label: "Market"        },
};

const CATEGORY_KEYS = [
  { key: "floodScore",         cat: "FLOOD"         },
  { key: "legalScore",         cat: "LEGAL"         },
  { key: "taxScore",           cat: "TAX"           },
  { key: "zoningScore",        cat: "ZONING"        },
  { key: "environmentalScore", cat: "ENVIRONMENTAL" },
  { key: "marketScore",        cat: "MARKET"        },
];

function scoreToLevel(s) {
  if (s == null) return "LOW";
  if (s >= 75) return "CRITICAL";
  if (s >= 50) return "HIGH";
  if (s >= 25) return "MEDIUM";
  return "LOW";
}

// ─── Animated counter ─────────────────────────────────────────────────────────

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

// ─── Recharts sub-components (hoisted) ────────────────────────────────────────

const CustomBarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d   = payload[0].payload;
  const cfg = CATEGORY_CONFIG[d.category];
  return (
    <div style={{
      background: "#161b22", border: "1px solid #30363d",
      borderRadius: 12, padding: "10px 14px", minWidth: 150,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
        <span style={{ color: cfg.color, fontWeight: 700, fontSize: 12 }}>{cfg.label}</span>
      </div>
      <p style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>
        Avg Score: {d.avgScore.toFixed(1)}
      </p>
      <p style={{ color: "#7d8590", fontSize: 11, marginTop: 2 }}>
        Across {d.count} properties
      </p>
    </div>
  );
};

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cat = Object.keys(CATEGORY_CONFIG).find(k => CATEGORY_CONFIG[k].label === d.subject);
  const cfg = cat ? CATEGORY_CONFIG[cat] : { color: "#22C55E" };
  return (
    <div style={{
      background: "#161b22", border: "1px solid #30363d",
      borderRadius: 10, padding: "8px 12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <p style={{ color: cfg.color, fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{d.subject}</p>
      <p style={{ color: "#e6edf3", fontSize: 13 }}>
        Avg: <strong>{Number(d.value).toFixed(1)}</strong>
      </p>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-pulse">
      <div className="h-36 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
        <div className="h-80 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
      </div>
      <div className="h-64 rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
    </div>
  );
}

// ─── Mini score ring ──────────────────────────────────────────────────────────

function MiniRing({ score, level, size = 48 }) {
  const cfg    = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.LOW;
  const r      = (size - 10) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4.5} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={cfg.color} strokeWidth={4.5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size > 50 ? 14 : 11, fontWeight: 800, color: cfg.color,
        fontVariantNumeric: "tabular-nums",
      }}>
        {score}
      </span>
    </div>
  );
}

// ─── Hero ring ────────────────────────────────────────────────────────────────

function HeroRing({ score, level }) {
  const cfg    = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.LOW;
  const size   = 140;
  const r      = 56;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={cfg.color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: `drop-shadow(0 0 8px ${cfg.color}50)`,
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <AnimatedNumber
          value={score}
          decimals={1}
          style={{ fontSize: 28, fontWeight: 900, color: cfg.color, fontVariantNumeric: "tabular-nums" }}
        />
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: cfg.color, marginTop: 2,
        }}>
          {cfg.label} Risk
        </span>
      </div>
    </div>
  );
}

// ─── Level pill ───────────────────────────────────────────────────────────────

function LevelPill({ level, size = "sm" }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.LOW;
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

// ─── Info tooltip ─────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
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

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "score_desc", label: "Highest Risk" },
  { value: "score_asc",  label: "Lowest Risk"  },
  { value: "name_asc",   label: "Name A→Z"     },
];

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportToCSV(rows, filterLevel, filterCat) {
  const headers = [
    "Rank", "Property Address", "City", "State", "Property Type",
    "Market Value", "Overall Score", "Risk Level",
    "Flood", "Legal", "Tax", "Zoning", "Environmental", "Market",
    "Assessed At",
  ];

  const csvRows = rows.map((p, i) => [
    i + 1,
    `"${(p.address ?? "").replace(/"/g, '""')}"`,
    `"${(p.city ?? "").replace(/"/g, '""')}"`,
    p.state ?? "",
    p.propertyType ?? "",
    p.marketValue ?? "",
    p.overallScore ?? "",
    p.overallLevel ?? "",
    p.risk?.floodScore ?? "",
    p.risk?.legalScore ?? "",
    p.risk?.taxScore ?? "",
    p.risk?.zoningScore ?? "",
    p.risk?.environmentalScore ?? "",
    p.risk?.marketScore ?? "",
    p.risk?.calculatedAt ?? "",
  ].join(","));

  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const ts   = new Date().toISOString().split("T")[0];
  const suffix = filterLevel !== "ALL" ? `_${filterLevel.toLowerCase()}` : "";
  const catSuffix = filterCat !== "ALL" ? `_${filterCat.toLowerCase()}` : "";
  a.href = url;
  a.download = `portfolio_risk${suffix}${catSuffix}_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RiskAssessmentPortfolioPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [properties, setProperties]   = useState([]);
  const [riskMap, setRiskMap]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterCat, setFilterCat]     = useState("ALL");
  const [sortBy, setSortBy]           = useState("score_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreMode, setScoreMode]     = useState("weighted"); // "simple" | "weighted"

  useEffect(() => {
    document.title = "Risk Assessment | Real Estate Due Diligence";
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const props = await getAllProperties();
      setProperties(props ?? []);

      const results = await Promise.allSettled(
        (props ?? []).map((p) => getPropertyRisk(p.id))
      );

      const map = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          map[(props ?? [])[i].id] = r.value;
        }
      });
      setRiskMap(map);
    } catch (err) {
      setError(err?.message ?? "Failed to load portfolio risk data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ──

  const enriched = useMemo(() =>
    properties.map((p) => {
      const risk = riskMap[p.id];
      return {
        ...p, risk: risk ?? null,
        overallScore: risk?.overallScore ?? null,
        overallLevel: risk?.overallLevel ?? (risk ? scoreToLevel(risk.overallScore) : null),
      };
    }),
  [properties, riskMap]);

  const withRisk = useMemo(() => enriched.filter((p) => p.risk !== null), [enriched]);
  const noRisk   = useMemo(() => enriched.filter((p) => p.risk === null), [enriched]);

  const levelCounts = useMemo(() => {
    const c = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    withRisk.forEach((p) => { if (c[p.overallLevel] !== undefined) c[p.overallLevel]++; });
    return c;
  }, [withRisk]);

  // Two portfolio scores — simple average vs value-weighted
  const simpleAvgScore = useMemo(() => {
    if (!withRisk.length) return 0;
    return withRisk.reduce((s, p) => s + p.overallScore, 0) / withRisk.length;
  }, [withRisk]);

  const weightedScore = useMemo(() => {
    if (!withRisk.length) return 0;
    const totalValue = withRisk.reduce((s, p) => s + (p.marketValue ?? 0), 0);
    if (totalValue === 0) return simpleAvgScore;
    return withRisk.reduce((s, p) => s + p.overallScore * (p.marketValue ?? 0), 0) / totalValue;
  }, [withRisk, simpleAvgScore]);

  const displayScore = scoreMode === "weighted" ? weightedScore : simpleAvgScore;

  const categoryAverages = useMemo(() =>
    CATEGORY_KEYS.map(({ key, cat }) => {
      const vals = withRisk.map((p) => p.risk?.[key]).filter((v) => v != null);
      const avg  = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { category: cat, avgScore: avg, count: vals.length };
    }),
  [withRisk]);

  const radarData = useMemo(() =>
    categoryAverages.map((c) => ({
      subject: CATEGORY_CONFIG[c.category].label,
      value: c.avgScore,
      fullMark: 100,
    })),
  [categoryAverages]);

  // ── FILTERING (fixed) ──
  const filtered = useMemo(() => {
    let list = [...withRisk];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) =>
        (p.address ?? "").toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        (p.propertyType ?? "").toLowerCase().includes(q)
      );
    }

    // Level filter
    if (filterLevel !== "ALL") {
      list = list.filter((p) => p.overallLevel === filterLevel);
    }

    // Category filter — actually keeps only properties where THAT category has score >= 25
    if (filterCat !== "ALL") {
      const key = CATEGORY_KEYS.find((k) => k.cat === filterCat)?.key;
      if (key) {
        list = list.filter((p) => (p.risk?.[key] ?? 0) >= 25);
      }
    }

    // Sort
    if (filterCat !== "ALL") {
      // If category filter active, sort by that category's score
      const key = CATEGORY_KEYS.find((k) => k.cat === filterCat)?.key;
      if (key) {
        list.sort((a, b) => (b.risk?.[key] ?? 0) - (a.risk?.[key] ?? 0));
      }
    } else {
      switch (sortBy) {
        case "score_desc": list.sort((a, b) => b.overallScore - a.overallScore); break;
        case "score_asc":  list.sort((a, b) => a.overallScore - b.overallScore); break;
        case "name_asc":   list.sort((a, b) => (a.address ?? "").localeCompare(b.address ?? "")); break;
        default: break;
      }
    }

    return list;
  }, [withRisk, filterLevel, filterCat, sortBy, searchQuery]);

  const urgentProperties = useMemo(() =>
    withRisk
      .filter((p) => p.overallLevel === "CRITICAL" || p.overallLevel === "HIGH")
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5),
  [withRisk]);

  const catFilterActive = filterCat !== "ALL";
  const catFilterKey    = catFilterActive ? CATEGORY_KEYS.find((k) => k.cat === filterCat)?.key : null;
  const catFilterCfg    = catFilterActive ? CATEGORY_CONFIG[filterCat] : null;

  const clearAllFilters = () => {
    setFilterLevel("ALL");
    setFilterCat("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters = filterLevel !== "ALL" || filterCat !== "ALL" || searchQuery.trim();

  // ── Render ──

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-10 text-center">
          <AlertTriangle size={40} className="mx-auto mb-3 text-red-500" />
          <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          background: `linear-gradient(90deg, ${LEVEL_CONFIG.LOW.color}, ${LEVEL_CONFIG.MEDIUM.color}, ${LEVEL_CONFIG.HIGH.color}, ${LEVEL_CONFIG.CRITICAL.color})`,
        }} />

        <div className="p-6 flex flex-col md:flex-row items-center gap-8">
          {/* Ring */}
          <HeroRing score={displayScore} level={scoreToLevel(displayScore)} />

          {/* Middle */}
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
              Portfolio Risk Assessment
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#7d8590] mb-4">
              Monitoring {withRisk.length} of {properties.length} properties across 6 risk categories
            </p>

            {/* Score mode toggle */}
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-[#1c2128]
                border border-gray-200 dark:border-[#30363d]">
                <button
                  onClick={() => setScoreMode("weighted")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    scoreMode === "weighted"
                      ? "bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] shadow-sm"
                      : "text-gray-500 dark:text-[#7d8590]"
                  }`}
                >
                  Value-Weighted
                </button>
                <button
                  onClick={() => setScoreMode("simple")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    scoreMode === "simple"
                      ? "bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] shadow-sm"
                      : "text-gray-500 dark:text-[#7d8590]"
                  }`}
                >
                  Simple Avg
                </button>
              </div>
              <InfoTooltip
                text={
                  scoreMode === "weighted"
                    ? "Value-weighted: expensive properties count more. Industry standard (JLL, CBRE). Formula: Σ(score × value) / Σ(value)"
                    : "Simple average: every property counts equally. Formula: sum of scores / number of properties"
                }
              />
            </div>

            {/* Level KPI row */}
            <div className="grid grid-cols-4 gap-3">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).map((level) => {
                const cfg   = LEVEL_CONFIG[level];
                const count = levelCounts[level];
                const active = filterLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(active ? "ALL" : level)}
                    className="rounded-xl p-3 text-center transition cursor-pointer border bg-white dark:bg-[#1c2128]"
                    style={{
                      borderColor: active ? cfg.color : "transparent",
                      boxShadow: active ? `0 4px 16px ${cfg.color}25` : undefined,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, margin: "0 auto 6px",
                      background: cfg.bg,
                      boxShadow: `inset 0 0 0 1px ${cfg.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>
                        {count}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: cfg.color }}>
                      {cfg.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 dark:bg-[#1c2128]">
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(34,197,94,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Building2 size={17} color="#22C55E" strokeWidth={2.25} />
              </div>
              <div className="text-left">
                <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                  {withRisk.length}
                </p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-[#7d8590] uppercase tracking-wide">
                  Assessed
                </p>
              </div>
            </div>
            {noRisk.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 dark:bg-[#1c2128]">
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "rgba(245,158,11,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Activity size={17} color="#F59E0B" strokeWidth={2.25} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                    {noRisk.length}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-[#7d8590] uppercase tracking-wide">
                    Pending
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ══════════════ CHARTS ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(99,102,241,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BarChart3 size={17} color="#6366F1" strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">
                  Risk by Category
                </p>
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  {catFilterActive
                    ? `Filtered: ${catFilterCfg.label} focus`
                    : "Average score across portfolio"}
                </p>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={categoryAverages}
              margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
              barCategoryGap="30%"
            >
              <defs>
                {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                  <linearGradient key={cat} id={`bar-${cat}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0.5} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="category"
                tickFormatter={(v) => CATEGORY_CONFIG[v]?.label ?? v}
                tick={{ fontSize: 11, fill: "#7d8590", fontWeight: 600 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#6e7681" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="avgScore" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {categoryAverages.map(({ category }) => {
                  const dimmed = catFilterActive && category !== filterCat;
                  return (
                    <Cell
                      key={category}
                      fill={`url(#bar-${category})`}
                      fillOpacity={dimmed ? 0.2 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-[#21262d]">
            <button
              onClick={() => setFilterCat("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCat === "ALL"
                  ? "bg-gray-900 dark:bg-[#e6edf3] text-white dark:text-[#0d1117] shadow-sm"
                  : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#7d8590] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
            >
              All Categories
            </button>
            {CATEGORY_KEYS.map(({ cat }) => {
              const cfg    = CATEGORY_CONFIG[cat];
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(active ? "ALL" : cat)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                  style={active ? {
                    background: cfg.color,
                    color: "#fff",
                    boxShadow: `0 2px 8px ${cfg.color}40`,
                  } : {
                    background: "rgba(148,163,184,0.08)",
                    color: "#7d8590",
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: active ? "rgba(255,255,255,0.6)" : cfg.color,
                    display: "inline-block", flexShrink: 0,
                  }} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-5">
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(34,197,94,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={17} color="#22C55E" strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">
                Risk Profile
              </p>
              <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                Portfolio shape
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 0, right: 24, bottom: 0, left: 24 }}>
                <defs>
                  <radialGradient id="radar-glow">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.03} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.08)" gridType="polygon" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: "#7d8590", fontWeight: 600 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#22C55E"
                  fill="url(#radar-glow)"
                  strokeWidth={2}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-100 dark:border-[#21262d] justify-center">
            {CATEGORY_KEYS.map(({ cat }) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <span key={cat} className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-[#7d8590]">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ══════════════ NEEDS ATTENTION ══════════════ */}
      {urgentProperties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(239,68,68,0.15)",
            background: "linear-gradient(135deg, rgba(239,68,68,0.03), transparent)",
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(239,68,68,0.15)",
                boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={19} color="#EF4444" strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-[#e6edf3]">
                  Needs Immediate Attention
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                  {urgentProperties.length} properties with elevated risk
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {urgentProperties.map((p, i) => {
                const cfg = LEVEL_CONFIG[p.overallLevel];
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => router.push(`/properties/${p.id}/risk-analysis`)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl
                      bg-white dark:bg-[#161b22]
                      border border-gray-100 dark:border-[#30363d]
                      hover:border-gray-200 dark:hover:border-[#484f58]
                      hover:shadow-md transition text-left group"
                    style={{ borderLeft: `3px solid ${cfg.color}` }}
                  >
                    <MiniRing score={p.overallScore} level={p.overallLevel} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate">
                        {p.address}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                        {p.city}{p.state ? `, ${p.state}` : ""}
                      </p>
                    </div>
                    <LevelPill level={p.overallLevel} size="xs" />
                    <ChevronRight size={16} className="text-gray-300 dark:text-[#484f58] group-hover:text-gray-500 dark:group-hover:text-[#7d8590] transition flex-shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════ ALL PROPERTIES TABLE ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden"
      >
        {/* Table header */}
        <div className="p-6 border-b border-gray-100 dark:border-[#21262d] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  All Properties
                </p>
                <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                  {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}
                  {filterLevel !== "ALL" && (
                    <span style={{ color: LEVEL_CONFIG[filterLevel].color, fontWeight: 700 }}>
                      {" · "}{LEVEL_CONFIG[filterLevel].label} risk
                    </span>
                  )}
                  {filterCat !== "ALL" && (
                    <span style={{ color: CATEGORY_CONFIG[filterCat].color, fontWeight: 700 }}>
                      {" · "}{CATEGORY_CONFIG[filterCat].label} focus
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
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
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => exportToCSV(filtered, filterLevel, filterCat)}
                disabled={filtered.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                  bg-gradient-to-br from-[#22C55E] to-[#16a34a]
                  text-white shadow-[0_4px_12px_rgba(34,197,94,0.35)]
                  hover:shadow-[0_6px_16px_rgba(34,197,94,0.5)]
                  transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={13} />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, city, or type…"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3] transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#1c2128]
              border border-gray-200 dark:border-[#30363d]">
              <ArrowDownUp size={13} className="text-gray-400 dark:text-[#6e7681] ml-2 mr-1 flex-shrink-0" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  disabled={catFilterActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    sortBy === opt.value && !catFilterActive
                      ? "bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] shadow-sm"
                      : "text-gray-500 dark:text-[#7d8590] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  } ${catFilterActive ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-[#21262d] bg-gray-50/50 dark:bg-[#0d1117]/40">
          <span className="w-7 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center">Rank</span>
          <span className="w-12 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center">
            {catFilterActive ? catFilterCfg.label : "Score"}
          </span>
          <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">Property</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center" style={{ width: 100 }}>
            Categories
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] text-center" style={{ width: 80 }}>Level</span>
          <span style={{ width: 16 }} />
        </div>

        {/* Rows */}
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
                <Shield size={36} className="mx-auto mb-3 text-gray-300 dark:text-[#30363d]" />
                <p className="text-gray-500 dark:text-[#7d8590] font-medium text-sm">
                  No properties match the current filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-xs font-bold text-[#22C55E] hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              filtered.map((p, i) => {
                // If category filter active, show that category's score/level as primary
                const catScore = catFilterActive ? (p.risk?.[catFilterKey] ?? 0) : p.overallScore;
                const catLevel = catFilterActive ? scoreToLevel(catScore) : p.overallLevel;
                const cfg = LEVEL_CONFIG[catLevel] ?? LEVEL_CONFIG.LOW;
                return (
                  <motion.button
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: Math.min(i * 0.025, 0.5) }}
                    whileTap={{ scale: 0.997 }}
                    onClick={() => router.push(`/properties/${p.id}/risk-analysis`)}
                    className="w-full flex items-center gap-4 px-6 py-4
                      hover:bg-gray-50/80 dark:hover:bg-[#1c2128]/60
                      transition text-left group"
                    style={{ borderLeft: `3px solid ${cfg.color}` }}
                  >
                    {/* Rank */}
                    <span className="w-7 text-xs font-bold tabular-nums text-gray-400 dark:text-[#484f58] flex-shrink-0 text-center">
                      #{i + 1}
                    </span>

                    {/* Ring — reflects category score when filtered */}
                    <MiniRing score={catScore} level={catLevel} />

                    {/* Info */}
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
                        {catFilterActive && (
                          <span className="text-[10px] font-bold text-gray-400 dark:text-[#6e7681]">
                            (overall: {p.overallScore})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category bars */}
                    <div className="hidden lg:flex items-end gap-1.5 h-8" style={{ width: 100, justifyContent: "center" }}>
                      {CATEGORY_KEYS.map(({ key, cat }) => {
                        const score  = p.risk?.[key] ?? 0;
                        const catCfg = CATEGORY_CONFIG[cat];
                        const dimmed = catFilterActive && cat !== filterCat;
                        return (
                          <div
                            key={cat}
                            title={`${catCfg.label}: ${score}`}
                            style={{
                              width: 6, height: 28, borderRadius: 3,
                              background: "rgba(255,255,255,0.06)",
                              position: "relative", overflow: "hidden",
                              opacity: dimmed ? 0.25 : 1,
                              transition: "opacity 0.3s",
                            }}
                          >
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              height: `${score}%`,
                              background: `linear-gradient(180deg, ${catCfg.color}, ${catCfg.color}88)`,
                              borderRadius: 3,
                              transition: "height 0.6s ease",
                            }} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Level pill */}
                    <div style={{ width: 80, display: "flex", justifyContent: "center" }}>
                      <LevelPill level={catLevel} size="xs" />
                    </div>

                    {/* Arrow */}
                    <ArrowUpRight
                      size={16}
                      className="text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] transition flex-shrink-0"
                    />
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Unassessed */}
        {noRisk.length > 0 && !hasActiveFilters && (
          <div className="border-t border-gray-100 dark:border-[#21262d] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: "rgba(245,158,11,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={12} color="#F59E0B" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wide">
                {noRisk.length} not yet assessed
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {noRisk.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push(`/properties/${p.id}/risk-analysis`)}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl
                    bg-gray-50 dark:bg-[#1c2128]
                    border border-gray-200 dark:border-[#30363d]
                    text-gray-600 dark:text-[#7d8590]
                    hover:border-[#22C55E]/50 hover:text-[#22C55E]
                    transition-all"
                >
                  {p.address ?? `Property #${p.id}`}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}