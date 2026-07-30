"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Plus,
  ShieldCheck,
  Edit3,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { getRecentActivity } from "@/services/dashboardService";
import i18n from "@/i18n";

// ── Time-ago helper — uses common.* keys already in translation files ─────
function timeAgo(date, t) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 5) return t("common.justNow");
  if (seconds < 60) return t("common.secondsAgo", { n: seconds });
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return t("common.minutesAgo", { n: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("common.hoursAgo", { n: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t("common.daysAgo", { n: days });
  // Older than a week — show absolute date in current locale
  return new Date(date).toLocaleDateString(i18n.language || "en-IN");
}

// ── Activity meta (visual props + translation KEY) ────────────────────────
function getActivityMeta(type) {
  switch (type) {
    case "PROPERTY_ADDED":
      return {
        icon: Plus,
        labelKey: "activity.types.propertyAdded",
        dotBg: "bg-green-100 dark:bg-[#0d2818]",
        iconColor: "text-[#16a34a] dark:text-green-400",
      };
    case "PROPERTY_VERIFIED":
      return {
        icon: ShieldCheck,
        labelKey: "activity.types.propertyVerified",
        dotBg: "bg-green-100 dark:bg-[#0d2818]",
        iconColor: "text-[#16a34a] dark:text-green-400",
      };
    case "PROPERTY_UPDATED":
    default:
      return {
        icon: Edit3,
        labelKey: "activity.types.propertyUpdated",
        dotBg: "bg-gray-100 dark:bg-[#1c2128]",
        iconColor: "text-gray-600 dark:text-[#7d8590]",
      };
  }
}

export default function ActivityFeed() {
  const { t } = useTranslation();

  // FILTERS moved inside component so labels can be translated.
  // Keys stay stable (ALL/ADDED/VERIFIED/UPDATED) for state logic.
  const FILTERS = useMemo(
    () => [
      { key: "ALL",      label: t("activity.filters.all")      },
      { key: "ADDED",    label: t("activity.filters.added")    },
      { key: "VERIFIED", label: t("activity.filters.verified") },
      { key: "UPDATED",  label: t("activity.filters.updated")  },
    ],
    [t]
  );

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");
  const [, forceTick] = useState(0);

  const load = async () => {
    try {
      const data = await getRecentActivity(10);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(tick);
  }, []);

  const visible = useMemo(() => {
    if (filter === "ALL") return items;
    const typeMap = {
      ADDED:    "PROPERTY_ADDED",
      VERIFIED: "PROPERTY_VERIFIED",
      UPDATED:  "PROPERTY_UPDATED",
    };
    return items.filter((i) => i.type === typeMap[filter]);
  }, [items, filter]);

  const counts = useMemo(() => {
    const c = { ALL: items.length, ADDED: 0, VERIFIED: 0, UPDATED: 0 };
    for (const i of items) {
      if (i.type === "PROPERTY_ADDED")    c.ADDED++;
      if (i.type === "PROPERTY_VERIFIED") c.VERIFIED++;
      if (i.type === "PROPERTY_UPDATED")  c.UPDATED++;
    }
    return c;
  }, [items]);

  // For "No X activity" empty state — lowercase-ish filter label for message
  const currentFilterLabel = FILTERS.find((f) => f.key === filter)?.label ?? "";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818]">
            <Activity className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("activity.title")}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
              {t("activity.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6e7681]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          {t("activity.live")}
        </div>
      </div>

      {!loading && items.length > 0 && (
        <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-[#30363d] px-6 py-3">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const count = counts[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#16a34a] text-white shadow-sm"
                    : "text-gray-500 dark:text-[#7d8590] hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 dark:text-[#7d8590]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-[#1c2128]">
              <Building2 className="h-5 w-5 text-gray-300 dark:text-[#6e7681]" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("activity.empty.noActivity")}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
              {t("activity.empty.addProperties")}
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("activity.empty.noFiltered", { filter: currentFilterLabel })}
            </p>
            <button
              onClick={() => setFilter("ALL")}
              className="mt-2 text-xs font-bold text-[#16a34a] dark:text-green-400 hover:underline"
            >
              {t("activity.showAll")}
            </button>
          </div>
        ) : (
          <>
            <ol className="relative space-y-4 border-l border-gray-100 dark:border-[#30363d] pl-6">
              {visible.map((item, idx) => (
                <ActivityRow key={`${item.propertyId}-${idx}`} item={item} />
              ))}
            </ol>

            <Link
              href="/dashboard/property-search"
              className="mt-5 flex items-center justify-center gap-1 text-xs font-bold text-[#16a34a] dark:text-green-400 transition-all hover:gap-2"
            >
              {t("activity.viewAllProperties")}
              <ArrowRight size={11} strokeWidth={2.5} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item }) {
  const { t } = useTranslation();
  const meta = getActivityMeta(item.type);
  const Icon = meta.icon;

  return (
    <li className="relative">
      <span
        className={`absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#161b22] ${meta.dotBg}`}
      >
        <Icon className={`h-2.5 w-2.5 ${meta.iconColor}`} strokeWidth={3} />
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-700 dark:text-[#e6edf3]">
            <span className="font-bold text-gray-900 dark:text-[#e6edf3]">{t(meta.labelKey)}</span>
            {item.propertyAddress && (
              <>
                :{" "}
                <span className="truncate font-semibold text-gray-700 dark:text-[#e6edf3]">
                  {item.propertyAddress}
                </span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
            {item.propertyCity && (
              <span className="font-semibold text-gray-600 dark:text-[#e6edf3]">
                {item.propertyCity}
              </span>
            )}
            {item.actorName && (
              <>
                {item.propertyCity && " · "}
                {t("activity.byActor", { name: item.actorName })}
              </>
            )}
          </p>
        </div>
        <span className="flex-shrink-0 text-[11px] font-medium text-gray-400 dark:text-[#6e7681] tabular-nums">
          {timeAgo(item.timestamp, t)}
        </span>
      </div>
    </li>
  );
}