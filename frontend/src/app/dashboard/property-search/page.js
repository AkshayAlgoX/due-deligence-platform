// frontend/src/app/dashboard/property-search/page.js
"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SearchX,
  Plus,
  SlidersHorizontal,
  Database,
  MapPin,
  Clock,
} from "lucide-react";

import SearchBar from "@/components/property/SearchBar";
import PropertyResultCard from "@/components/property/PropertyResultCard";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import EditPropertyModal from "@/components/property/EditPropertyModal";
import QuickImageUploadModal from "@/components/property/QuickImageUploadModal";
import FilterPanel from "@/components/property/FilterPanel";
import ActiveFilterChips from "@/components/property/ActiveFilterChips";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";

import { searchProperties, getPropertyRisk } from "@/services/propertyService";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import CompareBar from "@/components/property/CompareBar";

function timeAgo(date) {
  if (!date) return "just now";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5)  return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60)    return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)     return `${hrs}h ago`;
  return date.toLocaleDateString();
}

// Fetch risk for a batch of properties with controlled concurrency.
async function fetchRiskBatch(properties, onResult, signal) {
  const CONCURRENCY = 4;
  let i = 0;

  async function runNext() {
    while (i < properties.length) {
      if (signal?.aborted) return;
      const prop = properties[i++];
      try {
        const risk = await getPropertyRisk(prop.id);
        if (!signal?.aborted) onResult(prop.id, risk);
      } catch {
        // silently skip
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, properties.length) }, runNext)
  );
}

function PropertySearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [quickPhotoModalOpen, setQuickPhotoModalOpen] = useState(false);
  const [propertyForQuickPhoto, setPropertyForQuickPhoto] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [, forceTick] = useState(0);

  const [riskScores, setRiskScores] = useState(() => new Map());
  const riskAbortRef = useRef(null);

  const {
    filters,
    filtered: displayedResults,
    setFilter,
    toggleArrayFilter,
    removeFilter,
    clearAll,
    activeCount,
  } = usePropertyFilters(results, riskScores);

  const {
    compareList,
    toggleCompare,
    clearCompare,
    isSelected: isInCompare,
    canAddMore: canAddToCompare,
  } = useCompareSelection();

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiskForList = useCallback((list) => {
    if (riskAbortRef.current) riskAbortRef.current.abort();
    const controller = new AbortController();
    riskAbortRef.current = controller;
    setRiskScores(new Map());

    fetchRiskBatch(
      list,
      (id, risk) => {
        setRiskScores((prev) => {
          const next = new Map(prev);
          next.set(id, risk);
          return next;
        });
      },
      controller.signal
    );
  }, []);

  useEffect(() => {
    return () => riskAbortRef.current?.abort();
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const list = await searchProperties("");
      setResults(list);
      setAllProperties(list);
      setLastSyncedAt(new Date());
      if (list.length > 0) fetchRiskForList(list);
    } catch (err) {
      toast.error("Couldn't load properties", {
        description: err.message || "Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchRiskForList]);

  useEffect(() => {
    const urlQuery  = searchParams.get("q") ?? "";
    const urlAction = searchParams.get("action");
    const urlFilter = searchParams.get("filter");

    if (urlAction === "add") setModalOpen(true);
    if (urlFilter === "verified")   setFilter("verifiedOnly", true);
    if (urlFilter === "pending")    setFilter("pendingOnly", true);
    if (urlFilter === "high-risk")  setFilter("highRisk", true);

    if (urlQuery.trim()) {
      setSearchValue(urlQuery);
      handleSearch(urlQuery, { silent: false });
      searchProperties("").then((all) => {
        setAllProperties(all);
        fetchRiskForList(all);
      });
      setLastSyncedAt(new Date());
      setLoading(false);
    } else {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    async (query, options = {}) => {
      const { silent = false } = options;

      if (!query.trim()) {
        loadAll();
        return;
      }

      try {
        setSearching(true);
        const list = await searchProperties(query);
        setResults(list);
        setLastSyncedAt(new Date());
        fetchRiskForList(list);

        if (list.length === 0 && !silent) {
          toast.info("No matches", {
            description: "Try a different city, address, or ZIP code.",
          });
          return;
        }

        if (!silent) {
          toast.success(
            `Found ${list.length} propert${list.length === 1 ? "y" : "ies"}`,
            { duration: 2000 }
          );
        }
      } catch (err) {
        toast.error("Search failed", {
          description: err.message || "Please try again in a moment.",
        });
      } finally {
        setSearching(false);
      }
    },
    [loadAll, fetchRiskForList]
  );

  const handleSelectSuggestion = useCallback(
    (property) => {
      router.push(`/dashboard/property-search/${property.id}`);
    },
    [router]
  );

  const handleEditProperty = useCallback((property) => {
    setPropertyToEdit(property);
    setEditModalOpen(true);
  }, []);

  const handleQuickPhoto = useCallback((property) => {
    setPropertyForQuickPhoto(property);
    setQuickPhotoModalOpen(true);
  }, []);

  const handleUpdateSuccess = useCallback((updated) => {
    setResults((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setAllProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    getPropertyRisk(updated.id)
      .then((risk) => {
        setRiskScores((prev) => {
          const next = new Map(prev);
          next.set(updated.id, risk);
          return next;
        });
      })
      .catch(() => {});
    setLastSyncedAt(new Date());
  }, []);

  const stats = useMemo(() => {
    const total = allProperties.length;
    const uniqueCities = new Set(
      allProperties.map((p) => p.city?.trim()).filter(Boolean)
    ).size;
    const verifiedCount = allProperties.filter((p) => p.verified).length;
    const highRiskCount = Array.from(riskScores.values()).filter(
      (r) => r.riskLabel === "HIGH"
    ).length;
    return { total, cities: uniqueCities, verified: verifiedCount, highRisk: highRiskCount };
  }, [allProperties, riskScores]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
              Property search
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-sm text-gray-500">Loading portfolio...</span>
                </div>
              ) : stats.total === 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-medium text-gray-600">
                    Ready to index your first property
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#16a34a]">Live</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Database className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900 tabular-nums">{stats.total.toLocaleString()}</span>
                    <span className="text-gray-500">
                      {stats.total === 1 ? "property" : "properties"} indexed
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900 tabular-nums">{stats.cities}</span>
                    <span className="text-gray-500">
                      {stats.cities === 1 ? "city" : "cities"} covered
                    </span>
                  </div>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">
                      Synced{" "}
                      <span className="font-semibold text-gray-700">{timeAgo(lastSyncedAt)}</span>
                    </span>
                  </div>
                  {stats.highRisk > 0 && (
                    <>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <button
                        onClick={() => setFilter("highRisk", true)}
                        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition font-semibold"
                      >
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                        {stats.highRisk} high risk
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="group relative flex flex-shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_12px_30px_rgba(34,197,94,0.45)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Plus className="h-4 w-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Add property</span>
          </button>
        </div>

        <div className="mt-6">
          <SearchBar
            onSearch={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={results}
            initialValue={searchValue}
            isSearching={searching}
          />
        </div>
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!loading && !searching && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
            <SearchX className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-800">No properties found</p>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
            Try searching by city name, address, or ZIP code — or add your first property.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
          >
            <Plus className="h-4 w-4" />
            Add your first property
          </button>
        </div>
      )}

      {/* ── Results grid ───────────────────────────────────────────── */}
      {!loading && results.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-[11px] font-black text-green-700">
                {displayedResults.length}
              </span>
              <p className="text-sm font-semibold text-gray-700">
                {displayedResults.length === 1 ? "Property" : "Properties"}
                {activeCount > 0 && displayedResults.length !== results.length && (
                  <span className="text-gray-400 font-normal"> (of {results.length})</span>
                )}
              </p>
            </div>

            <button
              onClick={() => setFilterPanelOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeCount > 0
                  ? "border-[#22C55E] bg-green-50 text-[#16a34a] hover:bg-green-100"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#22C55E] px-1 text-[10px] font-black text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          <ActiveFilterChips
            filters={filters}
            removeFilter={removeFilter}
            clearAll={clearAll}
          />

          {displayedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-700">No properties match your filters</p>
              <p className="mt-1 text-xs text-gray-500">Try removing some filters or clearing them all</p>
              <button
                onClick={clearAll}
                className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedResults.map((p) => (
                <PropertyResultCard
                  key={p.id}
                  property={p}
                  isSelected={false}
                  onClick={() => router.push(`/dashboard/property-search/${p.id}`)}
                  onEdit={handleEditProperty}
                  onQuickPhoto={handleQuickPhoto}
                  riskScore={riskScores.get(p.id) ?? null}
                  onCompare={toggleCompare}
                  isInCompare={isInCompare(p.id)}
                  canAddToCompare={canAddToCompare}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadAll}
      />

      <EditPropertyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={propertyToEdit}
        onSuccess={handleUpdateSuccess}
      />

      <QuickImageUploadModal
        isOpen={quickPhotoModalOpen}
        onClose={() => setQuickPhotoModalOpen(false)}
        property={propertyForQuickPhoto}
        onSuccess={handleUpdateSuccess}
      />

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        setFilter={setFilter}
        toggleArrayFilter={toggleArrayFilter}
        clearAll={clearAll}
        properties={results}
        filteredCount={displayedResults.length}
      />

      {/* ── Compare bar ───────────────────────────────────────────── */}
      <CompareBar
        compareList={compareList}
        onRemove={toggleCompare}
        onClear={clearCompare}
      />
    </div>
  );
}

export default function PropertySearchPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm animate-pulse">
            <div className="h-8 w-48 rounded-lg bg-gray-200 mb-4" />
            <div className="h-14 w-full rounded-2xl bg-gray-100" />
          </div>
        </div>
      }
    >
      <PropertySearchInner />
    </Suspense>
  );
}