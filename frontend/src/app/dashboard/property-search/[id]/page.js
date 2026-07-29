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
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    document.title = "Property Details | Real Estate Due Diligence";
  }, []);

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
      <Breadcrumbs overrides={{ [id]: property?.address || "Property" }} />

      {/* ── Back navigation ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/property-search")}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </button>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <ErrorBoundary>
        <PropertyDetails property={property} onEdit={handleEdit} />
      </ErrorBoundary>

      {/* ══════════════════════════════════════════════════════════════
          BENTO GRID LAYOUT
          Priority-based, asymmetric, handles empty states gracefully
      ══════════════════════════════════════════════════════════════ */}
      <ErrorBoundary>
        <div className="space-y-6">

          {/* ── TIER 1: Executive Summary Row ─────────────────────────
              Compact stats side-by-side (Risk Score + Data Completeness)
              These are LIGHT cards — they set the context
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskScoreCard propertyId={property.id} />
            <DataCompletenessCard
              aggregated={aggregated}
              onRefresh={() => loadAggregation(id)}
              refreshing={loadingAggregated}
            />
          </div>

          {/* ── TIER 2: Financial + Legal (asymmetric pair) ───────────
              Ownership (compact) + Tax History (wider — table needs space)
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <OwnershipCard section={aggregated?.ownership} />
            </div>
            <div className="lg:col-span-7">
              <TaxHistorySection section={aggregated?.taxHistory} />
            </div>
          </div>

          {/* ── TIER 3: Location Intelligence (equal pair) ─────────────
              Zoning + Flood Risk — both need equal visual weight
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ZoningCard section={aggregated?.zoning} />
            <FloodZoneCard section={aggregated?.floodZone} />
          </div>

          {/* ── TIER 4: Permits (FULL WIDTH — timeline needs space) ───
              Permits often has 3-5 items in a list — deserves full width
          ───────────────────────────────────────────────────────────── */}
          <PermitsSection section={aggregated?.permits} />

          {/* ── TIER 5: Context Row (asymmetric pair) ─────────────────
              Environmental (wider — has AQI + multiple stats)
              Building Info (compact — often user-provided/empty)
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <EnvironmentalCard section={aggregated?.environmental} />
            </div>
            <div className="lg:col-span-5">
              <BuildingInformationCard
                property={property}
                onEdit={handleEdit}
              />
            </div>
          </div>

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