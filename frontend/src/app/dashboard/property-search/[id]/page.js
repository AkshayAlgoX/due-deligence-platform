"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Ruler,
  Building2,
  Layers,
  MapPin,
  BadgeCheck,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { getPropertyById } from "@/services/propertyService";
import { getAggregatedProperty } from "@/services/aggregationService";
import { formatINRFull, formatINR } from "@/utils/currency";
import { getPropertyHeroImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "@/components/property/PropertyImagePlaceholder";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PropertyHeroSkeleton } from "@/components/ui/Skeleton";

// ── Aggregation cards ─────────────────────────────────────────────────────────
import OwnershipCard        from "@/components/property/aggregation/OwnershipCard";
import TaxHistorySection    from "@/components/property/aggregation/TaxHistorySection";
import ZoningCard           from "@/components/property/aggregation/ZoningCard";
import FloodZoneCard        from "@/components/property/aggregation/FloodZoneCard";
import PermitsSection       from "@/components/property/aggregation/PermitsSection";
import EnvironmentalCard    from "@/components/property/aggregation/EnvironmentalCard";
import DataCompletenessCard from "@/components/property/aggregation/DataCompletenessCard";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import EditPropertyModal    from "@/components/property/EditPropertyModal";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [property,          setProperty]          = useState(null);
  const [aggregated,        setAggregated]        = useState(null);
  const [loadingProperty,   setLoadingProperty]   = useState(true);
  const [loadingAggregated, setLoadingAggregated] = useState(false);
  const [editModalOpen,     setEditModalOpen]     = useState(false);

  // ── Load property + aggregation ──────────────────────────────────────────
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

  const handleEditSuccess = (updated) => {
    setProperty(updated);
    loadAggregation(updated.id);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingProperty) {
    return (
      <div className="mx-auto w-full max-w-[1200px] space-y-6 pb-16">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-gray-100" />
        <PropertyHeroSkeleton />
      </div>
    );
  }

  if (!property) return null;

  const {
    address,
    city,
    state,
    zipCode,
    propertyType,
    marketValue,
    area,
    bedrooms,
    bathrooms,
    yearBuilt,
    lotSize,
    zoning,
    stories,
    verified,
  } = property;

  const heroImage  = getPropertyHeroImage(property);
  const locationLine = [city, state].filter(Boolean).join(", ");
  const fullAddress  = [address, locationLine, zipCode].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 pb-16">

      {/* ── Back navigation ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </button>

      {/* ── Hero image grid — Zillow-style layout ─────────────────────────
          Left: 1 large image  |  Right: 2×2 grid of smaller images
          We only have 1 image per property — fill remaining slots with
          the placeholder so the grid shape is always maintained.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-[3fr_2fr]">

          {/* Large left image */}
          <div className="relative row-span-2 min-h-[320px] sm:min-h-[420px]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={address}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <PropertyImagePlaceholder propertyType={propertyType} size="hero" />
            )}

            {/* Verification badge */}
            <div className="absolute top-4 left-4">
              {verified ? (
                <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
                  <BadgeCheck className="h-4 w-4 text-[#22C55E]" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-gray-800">Verified property</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 shadow-md ring-1 ring-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-amber-800">Pending verification</span>
                </div>
              )}
            </div>
          </div>

          {/* 2×2 right images — same image or placeholder repeated */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative min-h-[100px] sm:min-h-[104px] bg-gray-100">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={`${address} view ${i + 2}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
              ) : (
                <PropertyImagePlaceholder propertyType={propertyType} size="thumb" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Price + address + quick facts ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">

          {/* Left: price + address */}
          <div className="min-w-0">
            {propertyType && (
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#22C55E]">
                {propertyType}
              </p>
            )}

            {marketValue != null && (
              <p className="text-[36px] font-black leading-none tracking-tight text-gray-900">
                {formatINRFull(marketValue)}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="font-semibold">{fullAddress}</span>
            </div>

            {/* Beds · Baths · Sqft — Zillow-style quick facts */}
            {(bedrooms != null || bathrooms != null || area != null) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                {bedrooms != null && (
                  <QuickFact icon={Bed} value={bedrooms} label="beds" />
                )}
                {bathrooms != null && (
                  <QuickFact icon={Bath} value={bathrooms} label="baths" />
                )}
                {area != null && (
                  <QuickFact icon={Maximize} value={area.toLocaleString()} label="sqft" />
                )}
              </div>
            )}
          </div>

          {/* Right: edit button */}
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] active:scale-95"
          >
            <Pencil className="h-4 w-4" strokeWidth={2.2} />
            Edit property
          </button>
        </div>

        {/* ── Stats row — Zillow-style property facts ───────────────────── */}
        {[yearBuilt, lotSize, zoning, stories].some((v) => v != null) && (
          <>
            <div className="my-5 h-px bg-gray-100" />
            <div className="flex flex-wrap gap-3">
              {propertyType && (
                <StatChip icon={Building2} label={propertyType} />
              )}
              {yearBuilt != null && (
                <StatChip icon={Calendar} label={`Built in ${yearBuilt}`} />
              )}
              {lotSize != null && lotSize > 0 && (
                <StatChip icon={Ruler} label={`${lotSize.toLocaleString()} sqft lot`} />
              )}
              {stories != null && (
                <StatChip icon={Layers} label={`${stories} ${stories === 1 ? "story" : "stories"}`} />
              )}
              {zoning && (
                <StatChip icon={Building2} label={zoning} />
              )}
              {area != null && (
                <StatChip icon={Maximize} label={`₹${Math.round(marketValue / area).toLocaleString("en-IN")}/sqft`} />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Aggregation sections ──────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Row 1: Ownership + Tax history */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ErrorBoundary>
              <OwnershipCard section={aggregated?.ownership} />
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-7">
            <ErrorBoundary>
              <TaxHistorySection section={aggregated?.taxHistory} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Row 2: Zoning + Flood zone */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorBoundary><ZoningCard section={aggregated?.zoning} /></ErrorBoundary>
          <ErrorBoundary><FloodZoneCard section={aggregated?.floodZone} /></ErrorBoundary>
        </div>

        {/* Row 3: Permits + Environmental */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ErrorBoundary><PermitsSection section={aggregated?.permits} /></ErrorBoundary>
          </div>
          <div className="lg:col-span-5">
            <ErrorBoundary><EnvironmentalCard section={aggregated?.environmental} /></ErrorBoundary>
          </div>
        </div>

        {/* Row 4: Building info + Data completeness */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorBoundary>
            <BuildingInformationCard property={property} />
          </ErrorBoundary>
          <ErrorBoundary>
            <DataCompletenessCard
              aggregated={aggregated}
              onRefresh={() => loadAggregation(id)}
              refreshing={loadingAggregated}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <EditPropertyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={property}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function QuickFact({ icon: Icon, value, label }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-black text-gray-900 tabular-nums">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function StatChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={2} />
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
  );
}
