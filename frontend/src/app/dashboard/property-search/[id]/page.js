"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getPropertyById } from "@/services/propertyService";
import { getAggregatedProperty } from "@/services/aggregationService";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PropertyHeroSkeleton } from "@/components/ui/Skeleton";

import PropertyDetails from "@/components/property/PropertyDetails";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import RiskScoreCard from "@/components/property/RiskScoreCard";
import EditPropertyModal from "@/components/property/EditPropertyModal";

// ── Aggregation cards ─────────────────────────────────────────────────
import OwnershipCard from "@/components/property/aggregation/OwnershipCard";
import TaxHistorySection from "@/components/property/aggregation/TaxHistorySection";
import ZoningCard from "@/components/property/aggregation/ZoningCard";
import FloodZoneCard from "@/components/property/aggregation/FloodZoneCard";
import PermitsSection from "@/components/property/aggregation/PermitsSection";
import EnvironmentalCard from "@/components/property/aggregation/EnvironmentalCard";
import DataCompletenessCard from "@/components/property/aggregation/DataCompletenessCard";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState(null);
  const [aggregated, setAggregated] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [loadingAggregated, setLoadingAggregated] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadAggregation = useCallback(async (propertyId) => {
    try {
      setLoadingAggregated(true);
      setAggregated(null);
      const data = await getAggregatedProperty(propertyId);
      setAggregated(data);
    } catch (err) {
      toast.error("Could not load property details", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setLoadingAggregated(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoadingProperty(true);
        const data = await getPropertyById(id);
        setProperty(data);
        loadAggregation(id);
      } catch (err) {
        toast.error("Property not found", {
          description: err?.message || "It may have been removed.",
        });
        router.push("/dashboard/property-search");
      } finally {
        setLoadingProperty(false);
      }
    };
    load();
  }, [id, router, loadAggregation]);

  const handleEdit = () => setEditModalOpen(true);

  const handleEditSuccess = (updated) => {
    setProperty(updated);
    loadAggregation(updated.id);
  };

  // ── Loading state ────────────────────────────────────────────────
  if (loadingProperty) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-16">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-gray-100" />
        <PropertyHeroSkeleton />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-16">

      {/* ── Back navigation ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/property-search")}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </button>

      {/* ── Hero (same component as search page) ───────────────────── */}
      <ErrorBoundary>
        <PropertyDetails property={property} onEdit={handleEdit} />
      </ErrorBoundary>

      {/* ── Aggregation + Risk sections ────────────────────────────── */}
      <ErrorBoundary>
        <div className="space-y-6">

          {/* Row 1: Ownership + Tax history */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 lg:col-span-5 flex">
              <div className="w-full">
                <OwnershipCard section={aggregated?.ownership} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-7 flex">
              <div className="w-full">
                <TaxHistorySection section={aggregated?.taxHistory} />
              </div>
            </div>
          </div>

          {/* Row 2: Zoning + Flood zone */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 lg:col-span-6 flex">
              <div className="w-full">
                <ZoningCard section={aggregated?.zoning} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 flex">
              <div className="w-full">
                <FloodZoneCard section={aggregated?.floodZone} />
              </div>
            </div>
          </div>

          {/* Row 3: Permits + Environmental */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 lg:col-span-7 flex">
              <div className="w-full">
                <PermitsSection section={aggregated?.permits} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 flex">
              <div className="w-full">
                <EnvironmentalCard section={aggregated?.environmental} />
              </div>
            </div>
          </div>

          {/* Row 4: Risk score + Building info */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 lg:col-span-6 flex">
              <div className="w-full">
                <RiskScoreCard propertyId={property.id} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 flex">
              <div className="w-full">
                <BuildingInformationCard property={property} />
              </div>
            </div>
          </div>

          {/* Row 5: Data completeness (full width) */}
          <DataCompletenessCard
            aggregated={aggregated}
            onRefresh={() => loadAggregation(id)}
            refreshing={loadingAggregated}
          />
        </div>
      </ErrorBoundary>

      {/* ── Edit modal ─────────────────────────────────────────────── */}
      <EditPropertyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={property}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}