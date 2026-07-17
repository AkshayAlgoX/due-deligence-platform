"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchX, Plus } from "lucide-react";

import SearchBar from "@/components/property/SearchBar";
import PropertyDetails from "@/components/property/PropertyDetails";
import PropertyResultCard from "@/components/property/PropertyResultCard";
import OwnershipCard from "@/components/property/OwnershipCard";
import TaxHistoryTable from "@/components/property/TaxHistoryTable";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import TransactionHistoryTable from "@/components/property/TransactionHistoryTable";
import ActionButtons from "@/components/property/ActionButtons";
import AddPropertyModal from "@/components/property/AddPropertyModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  PropertyCardSkeleton,
  PropertyHeroSkeleton,
} from "@/components/ui/Skeleton";

import { searchProperties, getPropertyById } from "@/services/propertyService";

export default function PropertySearchPage() {
  const [results, setResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const list = await searchProperties("");
      setResults(list);
      if (list.length > 0) {
        const detail = await getPropertyById(list[0].id);
        setSelectedProperty(detail);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Check for search query in URL (from navbar global search)
  const params = new URLSearchParams(window.location.search);
  const urlQuery = params.get("q");

  if (urlQuery) {
    handleSearch(urlQuery);
  } else {
    loadAll();
  }
}, []);

  const handleSearch = async (query) => {
    try {
      setSearching(true);
      const list = await searchProperties(query);
      setResults(list);

      if (list.length === 0) {
        toast.info("No properties found matching your search.");
        setSelectedProperty(null);
        return;
      }

      const detail = await getPropertyById(list[0].id);
      setSelectedProperty(detail);
      toast.success(
        `Found ${list.length} propert${list.length > 1 ? "ies" : "y"}`
      );
    } catch (err) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = async (property) => {
    try {
      setSearching(true);
      const detail = await getPropertyById(property.id);
      setSelectedProperty(detail);
      setTimeout(() => {
        document
          .getElementById("property-hero")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast.error(err.message || "Failed to load property");
    } finally {
      setSearching(false);
    }
  };

  const handleCompare = () => {
    toast.info("Compare Property — coming soon!");
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* Header + Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
              Property Search
            </h1>
            <p className="mt-1 text-gray-500">
              Validate property addresses and retrieve comprehensive ownership, tax and structural data.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>

        <div className="mt-6">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Loading — skeleton grid */}
      {loading && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <PropertyHeroSkeleton />
        </>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20">
          <SearchX className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            No properties found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Try a different address, city, or ZIP code.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#16a34a]"
          >
            <Plus className="h-4 w-4" />
            Add Your First Property
          </button>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {results.length} Results
            </p>
            <p className="text-xs text-gray-400">
              Click a property to view details
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PropertyResultCard
                key={p.id}
                property={p}
                isSelected={selectedProperty?.id === p.id}
                onClick={() => handleSelectResult(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Searching indicator - subtle */}
      {searching && !loading && (
        <div className="flex items-center justify-center py-2">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/3 animate-pulse bg-[#22C55E]" />
          </div>
        </div>
      )}

      {/* Hero card wrapped in ErrorBoundary */}
      {!loading && selectedProperty && (
        <ErrorBoundary>
          <div id="property-hero">
            <PropertyDetails
              property={selectedProperty}
              onCompare={handleCompare}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Detail sections */}
      {!loading && selectedProperty && (
        <ErrorBoundary>
          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <OwnershipCard />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TaxHistoryTable />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <BuildingInformationCard />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TransactionHistoryTable />
            </div>
          </div>

          <ActionButtons />
        </ErrorBoundary>
      )}

      <AddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadAll}
      />
    </div>
  );
}