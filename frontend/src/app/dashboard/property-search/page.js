"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import PropertyDetails from "@/components/property/PropertyDetails";
import PropertyResultCard from "@/components/property/PropertyResultCard";
import OwnershipCard from "@/components/property/OwnershipCard";
import TaxHistoryTable from "@/components/property/TaxHistoryTable";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import TransactionHistoryTable from "@/components/property/TransactionHistoryTable";
import ActionButtons from "@/components/property/ActionButtons";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import EditPropertyModal from "@/components/property/EditPropertyModal";
import FilterPanel from "@/components/property/FilterPanel";
import ActiveFilterChips from "@/components/property/ActiveFilterChips";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  PropertyCardSkeleton,
  PropertyHeroSkeleton,
} from "@/components/ui/Skeleton";

import { searchProperties, getPropertyById } from "@/services/propertyService";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";

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

function PropertySearchInner() {
  const searchParams = useSearchParams();

  const [results, setResults] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [, forceTick] = useState(0);

  // ── Filter engine — applied to `results` ────────────────────────
  const {
    filters,
    filtered: displayedResults,
    setFilter,
    toggleArrayFilter,
    removeFilter,
    clearAll,
    activeCount,
  } = usePropertyFilters(results);

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const list = await searchProperties("");
      setResults(list);
      setAllProperties(list);
      setLastSyncedAt(new Date());
      if (list.length > 0) {
        const detail = await getPropertyById(list[0].id);
        setSelectedProperty(detail);
      } else {
        setSelectedProperty(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlAction = searchParams.get("action");

    if (urlAction === "add") setModalOpen(true);

    if (urlQuery.trim()) {
      setSearchValue(urlQuery);
      handleSearch(urlQuery, { silent: false });
      searchProperties("").then((all) => setAllProperties(all));
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

        if (list.length === 0) {
          setSelectedProperty(null);
          if (!silent) toast.info("No properties found — try a different term.");
          return;
        }

        const detail = await getPropertyById(list[0].id);
        setSelectedProperty(detail);

        if (!silent) {
          toast.success(
            `Found ${list.length} propert${list.length === 1 ? "y" : "ies"}`,
            { duration: 2000 }
          );
        }
      } catch (err) {
        toast.error(err.message || "Search failed — please try again.");
      } finally {
        setSearching(false);
      }
    },
    [loadAll]
  );

  const handleSelectSuggestion = useCallback(async (property) => {
    try {
      setSearching(true);
      const detail = await getPropertyById(property.id);
      setSelectedProperty(detail);
      setResults([property]);
      setTimeout(() => {
        document.getElementById("property-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast.error(err.message || "Failed to load property details");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectResult = useCallback(async (property) => {
    try {
      setSearching(true);
      const detail = await getPropertyById(property.id);
      setSelectedProperty(detail);
      setTimeout(() => {
        document.getElementById("property-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast.error(err.message || "Failed to load property details");
    } finally {
      setSearching(false);
    }
  }, []);

  // ── Edit flow ────────────────────────────────────────────────────
  const handleEditProperty = useCallback((property) => {
    setPropertyToEdit(property);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = useCallback((updated) => {
    // Update in both results and allProperties
    setResults((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setAllProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProperty?.id === updated.id) {
      setSelectedProperty(updated);
    }
    setLastSyncedAt(new Date());
  }, [selectedProperty]);

  // ── Derived stats for header data strip ────────────────────────
  const stats = useMemo(() => {
    const total = allProperties.length;
    const uniqueCities = new Set(allProperties.map((p) => p.city?.trim()).filter(Boolean)).size;
    const verifiedCount = allProperties.filter((p) => p.verified).length;
    return { total, cities: uniqueCities, verified: verifiedCount };
  }, [allProperties]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
              Property Search
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                  <span className="text-sm text-gray-400">Loading portfolio...</span>
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#16a34a]">
                      Live
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Database className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900 tabular-nums">
                      {stats.total.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {stats.total === 1 ? "property" : "properties"} indexed
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900 tabular-nums">
                      {stats.cities}
                    </span>
                    <span className="text-gray-500">
                      {stats.cities === 1 ? "city" : "cities"} covered
                    </span>
                  </div>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">
                      Synced <span className="font-semibold text-gray-700">{timeAgo(lastSyncedAt)}</span>
                    </span>
                  </div>
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
            <span className="relative z-10">Add Property</span>
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

      {/* Loading skeleton */}
      {loading && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} />)}
            </div>
          </div>
          <PropertyHeroSkeleton />
        </>
      )}

      {/* Empty state (no results at all) */}
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
            Add Your First Property
          </button>
        </div>
      )}

      {/* Results grid + filters */}
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
                  <span className="text-gray-400 font-normal">
                    {" "}(of {results.length})
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => setFilterPanelOpen(true)}
              className={`
                relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5
                text-xs font-medium transition
                ${activeCount > 0
                  ? "border-[#22C55E] bg-green-50 text-[#16a34a] hover:bg-green-100"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
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

          {/* Active filter chips */}
          <ActiveFilterChips
            filters={filters}
            removeFilter={removeFilter}
            clearAll={clearAll}
          />

          {/* Filtered empty state */}
          {displayedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-700">
                No properties match your filters
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Try removing some filters or clearing them all
              </p>
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
                  isSelected={selectedProperty?.id === p.id}
                  onClick={() => handleSelectResult(p)}
                  onEdit={handleEditProperty}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Property hero + detail sections */}
      {!loading && selectedProperty && (
        <ErrorBoundary>
          <div id="property-hero">
            <PropertyDetails
              property={selectedProperty}
              onCompare={() => toast.info("Property comparison — coming soon!")}
            />
          </div>
        </ErrorBoundary>
      )}

      {!loading && selectedProperty && (
        <ErrorBoundary>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <OwnershipCard property={selectedProperty} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TaxHistoryTable property={selectedProperty} />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <BuildingInformationCard property={selectedProperty} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TransactionHistoryTable property={selectedProperty} />
            </div>
          </div>
          <ActionButtons property={selectedProperty} />
        </ErrorBoundary>
      )}

      {/* Modals */}
      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadAll}
      />

      <EditPropertyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={propertyToEdit}
        onSuccess={handleEditSuccess}
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