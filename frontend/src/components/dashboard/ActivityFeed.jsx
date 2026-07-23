"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Plus,
  ShieldCheck,
  Edit3,
  Building2,
  Loader2,
} from "lucide-react";
import { getRecentActivity } from "@/services/dashboardService";

/**
 * ActivityFeed — live-ish stream of property actions.
 *
 * Real data from /api/dashboard/activity. Refetches every 60s.
 * No fake events — derived from actual property state.
 */
export default function ActivityFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const interval = setInterval(load, 60000); // refetch every 60s
    return () => clearInterval(interval);
  }, []);

  // Re-render every 30s to update relative timestamps
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <Activity className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest actions across the platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </span>
          Live
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Building2 className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No activity yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Add properties to see activity here
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-gray-100 pl-6 space-y-4">
            {items.map((item, idx) => (
              <ActivityRow key={`${item.propertyId}-${idx}`} item={item} />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ─── Single activity row ───────────────────────────────────────
function ActivityRow({ item }) {
  const meta = getActivityMeta(item.type);
  const Icon = meta.icon;

  return (
    <li className="relative">
      {/* Timeline dot */}
      <span
        className={`absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${meta.dotBg}`}
      >
        <Icon className={`h-2.5 w-2.5 ${meta.iconColor}`} strokeWidth={3} />
      </span>

      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-gray-900">{meta.label}</span>
            {item.propertyAddress && (
              <>
                :{" "}
                <span className="font-semibold text-gray-700 truncate">
                  {item.propertyAddress}
                </span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {item.propertyCity && (
              <span className="font-semibold text-gray-600">
                {item.propertyCity}
              </span>
            )}
            {item.actorName && (
              <>
                {item.propertyCity && " · "}
                by <span className="font-semibold text-gray-600">{item.actorName}</span>
              </>
            )}
          </p>
        </div>
        <span className="flex-shrink-0 text-[11px] font-medium text-gray-400 tabular-nums">
          {timeAgo(item.timestamp)}
        </span>
      </div>
    </li>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function getActivityMeta(type) {
  switch (type) {
    case "PROPERTY_ADDED":
      return {
        icon: Plus,
        label: "Property added",
        dotBg: "bg-green-100",
        iconColor: "text-[#16a34a]",
      };
    case "PROPERTY_VERIFIED":
      return {
        icon: ShieldCheck,
        label: "Property verified",
        dotBg: "bg-green-100",
        iconColor: "text-[#16a34a]",
      };
    case "PROPERTY_UPDATED":
    default:
      return {
        icon: Edit3,
        label: "Property updated",
        dotBg: "bg-gray-100",
        iconColor: "text-gray-600",
      };
  }
}

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}