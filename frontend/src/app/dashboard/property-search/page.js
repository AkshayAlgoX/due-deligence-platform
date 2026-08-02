// frontend/src/app/dashboard/property-search/page.js
"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  SearchX,
  Plus,
  SlidersHorizontal,
  Database,
  MapPin,
  Clock,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/utils/animations";

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
import { getUser } from "@/utils/helpers";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import CompareBar from "@/components/property/CompareBar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// timeAgo now uses translation function
function timeAgo(date, t) {
  if (!date) return t("common.justNow");
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5)  return t("common.justNow");
  if (seconds < 60) return t("common.secondsAgo", { n: seconds });
  const mins = Math.floor(seconds / 60);
  if (mins < 60)    return t("common.minutesAgo", { n: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)     return t("common.hoursAgo", { n: hrs });
  return date.toLocaleDateString();
}

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
        // silent
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, properties.length) }, runNext)
  );
}

function PropertySearchInner() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUser = getUser();
  const canAddProperty =
    currentUser?.role === "ADMIN" ||
    ["BUYER", "REAL_ESTATE_AGENT"].includes(currentUser?.role);

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
    refreshSnapshot,
  } = useCompareSelection();

  useEffect(() => {
    document.title = t("property.search.pageTitle");
  }, [t]);

  useEffect(() => {
    const interval = setInterval(() => forceTick((tick) => tick + 1), 30000);
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
      toast.error(t("property.search.couldntLoad"), {
        description: err.message || t("property.search.pleaseRefresh"),
      });
    } finally {
      setLoading(false);
    }
  }, [fetchRiskForList, t]);

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
          toast.info(t("property.search.noMatches"), {
            description: t("property.search.tryDifferent"),
          });
          return;
        }

        if (!silent) {
          toast.success(
            t("property.search.found", {
              n: list.length,
              unit:
                list.length === 1
                  ? t("property.search.propertyUnit")
                  : t("property.search.propertiesUnit"),
            }),
            { duration: 2000 }
          );
        }
      } catch (err) {
        toast.error(t("property.search.searchFailed"), {
          description: err.message || t("property.search.tryAgain"),
        });
      } finally {
        setSearching(false);
      }
    },
    [loadAll, fetchRiskForList, t]
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
    // Refresh compare bar snapshot if this property is currently selected
    refreshSnapshot(updated);
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
  }, [refreshSnapshot]);

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
      <Breadcrumbs />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-extrabold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {t("property.search.title")}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-sm text-gray-500 dark:text-[#7d8590]">
                    {t("property.search.loadingPortfolio")}
                  </span>
                </div>
              ) : stats.total === 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-medium text-gray-600 dark:text-[#7d8590]">
                    {t("property.search.readyToIndex")}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#16a34a] dark:text-green-400">
                      {t("property.search.live")}
                    </span>
                  </div>
                  <span className="text-gray-300 dark:text-[#30363d]">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Database className="h-3.5 w-3.5 text-gray-400 dark:text-[#7d8590]" />
                    <span className="text-gray-500 dark:text-[#7d8590]">
                      {t("property.search.propertiesIndexed", {
                        n: stats.total.toLocaleString(),
                        unit:
                          stats.total === 1
                            ? t("property.search.propertyUnit")
                            : t("property.search.propertiesUnit"),
                      })}
                    </span>
                  </div>
                  <span className="text-gray-300 dark:text-[#30363d]">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-[#7d8590]" />
                    <span className="text-gray-500 dark:text-[#7d8590]">
                      {t("property.search.citiesCovered", {
                        n: stats.cities,
                        unit:
                          stats.cities === 1
                            ? t("property.search.cityUnit")
                            : t("property.search.citiesUnit"),
                      })}
                    </span>
                  </div>
                  <span className="text-gray-300 dark:text-[#30363d] hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-[#7d8590]" />
                    <span className="text-gray-500 dark:text-[#7d8590]">
                      {t("property.search.synced")}{" "}
                      <span className="font-semibold text-gray-700 dark:text-[#e6edf3]">
                        {timeAgo(lastSyncedAt, t)}
                      </span>
                    </span>
                  </div>
                  {stats.highRisk > 0 && (
                    <>
                      <span className="text-gray-300 dark:text-[#30363d] hidden sm:inline">•</span>
                      <button
                        onClick={() => setFilter("highRisk", true)}
                        className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition font-semibold"
                      >
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                        {t("property.search.highRisk", { n: stats.highRisk })}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {canAddProperty && (
            <button
              onClick={() => setModalOpen(true)}
              className="group relative flex flex-shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_12px_30px_rgba(34,197,94,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Plus className="h-4 w-4 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">{t("property.addProperty")}</span>
            </button>
          )}
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

      {/* ── Loading skeleton ────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!loading && !searching && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] flex items-center justify-center mb-4">
            <SearchX className="h-7 w-7 text-gray-300 dark:text-[#6e7681]" />
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-[#e6edf3]">
            {t("property.search.noPropertiesFound")}
          </p>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-[#7d8590] max-w-xs">
            {t("property.search.trySearching")}
          </p>
          {canAddProperty && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
            >
              <Plus className="h-4 w-4" />
              {t("property.addFirstProperty")}
            </button>
          )}
        </div>
      )}

      {/* ── Results grid ────────────────────────────────────────── */}
      {!loading && results.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-[#0d2818] text-[11px] font-black text-green-700 dark:text-green-400">
                {displayedResults.length}
              </span>
              <p className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">
                {displayedResults.length === 1
                  ? t("property.search.propertyUnit")
                  : t("property.search.propertiesUnit")}
                {activeCount > 0 && displayedResults.length !== results.length && (
                  <span className="text-gray-400 dark:text-[#6e7681] font-normal">
                    {" "}
                    {t("property.search.ofTotal", { n: results.length })}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => setFilterPanelOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeCount > 0
                  ? "border-[#22C55E] bg-green-50 dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 hover:bg-green-100 dark:hover:bg-[#0d2818]/70"
                  : "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-600 dark:text-[#7d8590] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#161b22]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("property.filter.filter")}
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
              <SearchX className="h-10 w-10 text-gray-200 dark:text-[#30363d] mb-3" />
              <p className="text-sm font-bold text-gray-700 dark:text-[#e6edf3]">
                {t("property.filter.noMatchFilters")}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
                {t("property.filter.tryRemoving")}
              </p>
              <button
                onClick={clearAll}
                className="mt-4 rounded-xl bg-gray-100 dark:bg-[#1c2128] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-200 dark:hover:bg-[#30363d]"
              >
                {t("property.filter.clearFilters")}
              </button>
            </div>
          ) : (
            <motion.div
              className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {displayedResults.map((p) => (
                <motion.div
                  key={p.id}
                  variants={staggerItem}
                  className="w-full self-stretch will-change-opacity"
                >
                  <PropertyResultCard
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Modals — dark treatment in Chunk F */}
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
          <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm animate-pulse">
            <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-[#1c2128] mb-4" />
            <div className="h-14 w-full rounded-2xl bg-gray-100 dark:bg-[#1c2128]" />
          </div>
        </div>
      }
    >
      <PropertySearchInner />
    </Suspense>
  );
}