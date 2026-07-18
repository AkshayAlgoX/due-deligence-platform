"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Home,
  Building2,
  FileSearch,
  ShieldAlert,
  GitCompare,
  FileText,
  Bell,
  ScrollText,
  UserCircle,
  Plus,
  LogOut,
  Clock,
  ArrowRight,
  CornerDownLeft,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { searchProperties } from "@/services/propertyService";
import { formatINR } from "@/utils/currency";
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "@/hooks/useCommandPalette";

// ─── Navigation routes (static, no API needed) ────────────────────────────────
const PAGES = [
  { id: "page-dashboard",      label: "Dashboard",           description: "Portfolio overview & KPIs",       icon: Home,        path: "/dashboard" },
  { id: "page-search",         label: "Property Search",     description: "Find & verify properties",         icon: FileSearch,  path: "/dashboard/property-search" },
  { id: "page-diligence",      label: "Due Diligence",       description: "Deep verification workflow",       icon: Building2,   path: "/dashboard/due-diligence" },
  { id: "page-risk",           label: "Risk Assessment",     description: "Risk scores & red flags",          icon: ShieldAlert, path: "/dashboard/risk-assessment" },
  { id: "page-compare",        label: "Property Comparison", description: "Side-by-side analysis",            icon: GitCompare,  path: "/dashboard/property-comparison" },
  { id: "page-reports",        label: "Reports",             description: "Generated PDF reports",            icon: FileText,    path: "/dashboard/reports" },
  { id: "page-notifications",  label: "Notifications",       description: "Alerts & activity feed",           icon: Bell,        path: "/dashboard/notifications" },
  { id: "page-audit",          label: "Audit Logs",          description: "Every action, timestamped",        icon: ScrollText,  path: "/dashboard/audit-logs" },
  { id: "page-profile",        label: "My Profile",          description: "Account & preferences",            icon: UserCircle,  path: "/dashboard/profile" },
];

// ─── Quick actions ────────────────────────────────────────────────────────────
const ACTIONS = [
  { id: "action-add-property", label: "Add New Property",  description: "Register a new listing",  icon: Plus,    kind: "add-property" },
  { id: "action-logout",       label: "Log Out",           description: "End your session",         icon: LogOut,  kind: "logout", danger: true },
];

/**
 * CommandPalette — global search modal (⌘K style).
 *
 * Searches across:
 *  - Static navigation pages
 *  - Live property data (debounced 400ms)
 *  - Quick actions (add property, logout)
 *
 * Props:
 *  @param {boolean} open       - controls visibility
 *  @param {function} onClose   - called when user closes palette
 *  @param {function} onAction  - called with action kind ("add-property" | "logout")
 */
export default function CommandPalette({ open, onClose, onAction }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [propertyResults, setPropertyResults] = useState([]);
  const [searchingProperties, setSearchingProperties] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [recent, setRecent] = useState([]);

  // ── Auto-focus input on open + reset state ─────────────────────────────────
  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      // Delay focus for animation smoothness
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Reset on close
      setQuery("");
      setPropertyResults([]);
      setHighlightIdx(0);
    }
  }, [open]);

  // ── Lock body scroll when open ─────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ── Debounced property search (400ms — faster than page search since inline) ─
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setPropertyResults([]);
      setSearchingProperties(false);
      return;
    }

    setSearchingProperties(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchProperties(query);
        setPropertyResults(results.slice(0, 5)); // cap at 5 in palette
      } catch {
        setPropertyResults([]);
      } finally {
        setSearchingProperties(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Filter pages by query ─────────────────────────────────────────────────
  const filteredPages = useMemo(() => {
    if (!query.trim()) return PAGES;
    const q = query.toLowerCase();
    return PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return ACTIONS;
    const q = query.toLowerCase();
    return ACTIONS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [query]);

  // ── Flat list of ALL selectable items (for keyboard navigation) ────────────
  const flatItems = useMemo(() => {
    const items = [];

    // Recent searches (only shown when query is empty)
    if (!query.trim() && recent.length > 0) {
      recent.forEach((q, i) => {
        items.push({ type: "recent", label: q, id: `recent-${i}` });
      });
    }

    filteredPages.forEach((p) => items.push({ type: "page", ...p }));
    propertyResults.forEach((p) =>
      items.push({ type: "property", id: `prop-${p.id}`, property: p })
    );
    filteredActions.forEach((a) => items.push({ type: "action", ...a }));

    return items;
  }, [query, recent, filteredPages, propertyResults, filteredActions]);

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [flatItems.length]);

  // ── Handle item selection ──────────────────────────────────────────────────
  const handleSelect = useCallback(
    (item) => {
      if (!item) return;

      if (item.type === "recent") {
        // Fill query with recent search
        setQuery(item.label);
        return;
      }

      if (item.type === "page") {
        router.push(item.path);
        addRecentSearch(item.label);
        onClose();
        return;
      }

      if (item.type === "property") {
        addRecentSearch(item.property.address || query);
        // Navigate to search page pre-filtered to this property's address
        router.push(
          `/dashboard/property-search?q=${encodeURIComponent(item.property.address || "")}`
        );
        onClose();
        return;
      }

      if (item.type === "action") {
        onClose();
        onAction?.(item.kind);
        return;
      }
    },
    [router, onClose, onAction, query]
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(flatItems[highlightIdx]);
    }
  };

  // ── Auto-scroll highlighted item into view ─────────────────────────────────
  useEffect(() => {
    if (!listRef.current) return;
    const highlightedEl = listRef.current.querySelector(
      `[data-idx="${highlightIdx}"]`
    );
    highlightedEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIdx]);

  const handleClearRecent = (e) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecent([]);
  };

  if (!open) return null;

  // ── Compute section indices for grouped rendering ─────────────────────────
  const showRecent = !query.trim() && recent.length > 0;
  let cursor = 0;
  const recentStart = cursor;
  if (showRecent) cursor += recent.length;
  const pagesStart = cursor;
  cursor += filteredPages.length;
  const propsStart = cursor;
  cursor += propertyResults.length;
  const actionsStart = cursor;

  const hasNoResults =
    query.trim() &&
    filteredPages.length === 0 &&
    propertyResults.length === 0 &&
    filteredActions.length === 0 &&
    !searchingProperties;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="
        relative w-full max-w-2xl
        rounded-2xl
        border border-gray-100
        bg-white
        shadow-[0_30px_80px_rgba(0,0,0,0.25)]
        overflow-hidden
        animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200
      ">
        {/* ── Search input ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
          {searchingProperties ? (
            <Loader2 className="h-5 w-5 text-[#22C55E] animate-spin flex-shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}

          <input
            ref={inputRef}
            id="command-palette-title"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, properties, or actions..."
            aria-label="Command palette search"
            className="
              flex-1
              bg-transparent
              text-base font-medium text-gray-900
              outline-none
              placeholder:text-gray-400
              placeholder:font-normal
            "
          />

          <kbd className="
            hidden sm:inline-flex items-center
            rounded-md border border-gray-200 bg-gray-50
            px-2 py-0.5
            text-[10px] font-mono font-semibold text-gray-500
          ">
            esc
          </kbd>

          <button
            onClick={onClose}
            className="
              flex h-7 w-7 items-center justify-center
              rounded-md
              text-gray-400
              transition hover:bg-gray-100 hover:text-gray-600
              sm:hidden
            "
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Results list ────────────────────────────────────────── */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {/* Empty state — no results */}
          {hasNoResults && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-700">
                No matches for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Try searching for a page name, property address, or action
              </p>
            </div>
          )}

          {/* ── RECENT SEARCHES ─────────────────────────────────── */}
          {showRecent && (
            <Section
              title="Recent"
              rightSlot={
                <button
                  onClick={handleClearRecent}
                  className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              }
            >
              {recent.map((q, i) => {
                const idx = recentStart + i;
                return (
                  <PaletteRow
                    key={`recent-${i}`}
                    idx={idx}
                    highlighted={idx === highlightIdx}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => handleSelect({ type: "recent", label: q })}
                    icon={<Clock className="h-4 w-4" />}
                    iconClass="bg-gray-100 text-gray-500"
                    label={q}
                    description="Recent search"
                  />
                );
              })}
            </Section>
          )}

          {/* ── PAGES ───────────────────────────────────────────── */}
          {filteredPages.length > 0 && (
            <Section
              title="Pages"
              badge={filteredPages.length}
            >
              {filteredPages.map((p, i) => {
                const idx = pagesStart + i;
                const Icon = p.icon;
                return (
                  <PaletteRow
                    key={p.id}
                    idx={idx}
                    highlighted={idx === highlightIdx}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => handleSelect({ type: "page", ...p })}
                    icon={<Icon className="h-4 w-4" strokeWidth={2.2} />}
                    iconClass="bg-blue-50 text-blue-600"
                    label={p.label}
                    description={p.description}
                  />
                );
              })}
            </Section>
          )}

          {/* ── PROPERTIES (live from API) ──────────────────────── */}
          {propertyResults.length > 0 && (
            <Section
              title="Properties"
              badge={propertyResults.length}
              subtitle="Live from database"
            >
              {propertyResults.map((prop, i) => {
                const idx = propsStart + i;
                return (
                  <PaletteRow
                    key={`prop-${prop.id}`}
                    idx={idx}
                    highlighted={idx === highlightIdx}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() =>
                      handleSelect({
                        type: "property",
                        id: `prop-${prop.id}`,
                        property: prop,
                      })
                    }
                    icon={<Building2 className="h-4 w-4" strokeWidth={2.2} />}
                    iconClass="bg-green-50 text-green-600"
                    label={prop.address || "Untitled property"}
                    description={
                      [prop.city, prop.state, prop.zipCode]
                        .filter(Boolean)
                        .join(", ") || "Location unknown"
                    }
                    rightSlot={
                      prop.marketValue > 0 && (
                        <span className="text-[11px] font-black text-[#16a34a] tabular-nums">
                          {formatINR(prop.marketValue)}
                        </span>
                      )
                    }
                  />
                );
              })}
            </Section>
          )}

          {/* Property loading spinner (while typing) */}
          {searchingProperties && propertyResults.length === 0 && query.trim() && (
            <div className="px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching properties...
            </div>
          )}

          {/* ── ACTIONS ─────────────────────────────────────────── */}
          {filteredActions.length > 0 && (
            <Section title="Actions">
              {filteredActions.map((a, i) => {
                const idx = actionsStart + i;
                const Icon = a.icon;
                return (
                  <PaletteRow
                    key={a.id}
                    idx={idx}
                    highlighted={idx === highlightIdx}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => handleSelect({ type: "action", ...a })}
                    icon={<Icon className="h-4 w-4" strokeWidth={2.2} />}
                    iconClass={
                      a.danger
                        ? "bg-red-50 text-red-600"
                        : "bg-purple-50 text-purple-600"
                    }
                    label={a.label}
                    description={a.description}
                    danger={a.danger}
                  />
                );
              })}
            </Section>
          )}
        </div>

        {/* ── Footer with keyboard hints ─────────────────────────── */}
        <div className="
          border-t border-gray-100
          bg-gray-50/70
          px-4 py-2.5
          flex items-center justify-between
        ">
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono text-[9px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono text-[9px]">↵</kbd>
              Select
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono text-[9px]">esc</kbd>
              Close
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            Powered by Due Diligence AI
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable section header ────────────────────────────────────────────────
function Section({ title, badge, subtitle, rightSlot, children }) {
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black tracking-widest uppercase text-gray-400">
            {title}
          </p>
          {badge !== undefined && (
            <span className="text-[9px] font-bold text-gray-400 tabular-nums">
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="text-[10px] text-gray-400 italic">
              · {subtitle}
            </span>
          )}
        </div>
        {rightSlot}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Reusable palette row ──────────────────────────────────────────────────
function PaletteRow({
  idx,
  highlighted,
  onMouseEnter,
  onClick,
  icon,
  iconClass,
  label,
  description,
  rightSlot,
  danger,
}) {
  return (
    <button
      type="button"
      data-idx={idx}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3
        px-4 py-2.5
        text-left
        transition-colors
        ${highlighted
          ? danger
            ? "bg-red-50"
            : "bg-gray-50"
          : "hover:bg-gray-50/60"
        }
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 flex h-8 w-8 items-center justify-center
        rounded-lg
        ${highlighted ? "shadow-sm" : ""}
        ${iconClass}
      `}>
        {icon}
      </div>

      {/* Label + description */}
      <div className="min-w-0 flex-1">
        <p className={`
          text-sm font-semibold truncate
          ${danger ? "text-red-700" : "text-gray-900"}
        `}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Right slot (price, kbd hint, etc.) */}
      {rightSlot && (
        <div className="flex-shrink-0">
          {rightSlot}
        </div>
      )}

      {/* Enter hint on highlighted */}
      {highlighted && (
        <CornerDownLeft
          className={`h-3.5 w-3.5 flex-shrink-0 ${
            danger ? "text-red-500" : "text-[#22C55E]"
          }`}
        />
      )}
    </button>
  );
}