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
  AlertTriangle,
  Pencil,
  Home,
  DollarSign,
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
  const { id }   = useParams();
  const router   = useRouter();

  const [property,          setProperty]          = useState(null);
  const [aggregated,        setAggregated]        = useState(null);
  const [loadingProperty,   setLoadingProperty]   = useState(true);
  const [loadingAggregated, setLoadingAggregated] = useState(false);
  const [editModalOpen,     setEditModalOpen]     = useState(false);

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

  // ── Loading ──────────────────────────────────────────────────────────────
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

  const heroImage    = getPropertyHeroImage(property);
  const locationLine = [city, state].filter(Boolean).join(", ");
  const fullAddress  = [address, locationLine, zipCode].filter(Boolean).join(", ");

  // Monthly estimate: very rough ~0.4% of market value per month
  const monthlyEst = marketValue ? Math.round(marketValue * 0.004) : null;

  // Price per sqft
  const pricePerSqft = marketValue && area ? Math.round(marketValue / area) : null;

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

                  {/* ── Single hero image (multi-photo gallery coming in v2) ── */}
                  <div className="relative overflow-hidden rounded-2xl h-[320px] sm:h-[480px] bg-gray-100">
                    {heroImage ? (
                      <img
                        src={heroImage}
                        alt={address}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PropertyImagePlaceholder propertyType={propertyType} size="hero" />
                      </div>
                    )}

                    {/* Verification badge */}
                    <div className="absolute top-4 left-4 z-10">
                      {verified ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
                          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                          <span className="text-xs font-bold text-gray-800">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 shadow-md ring-1 ring-amber-200 backdrop-blur-sm">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} />
                          <span className="text-xs font-bold text-amber-800">Pending verification</span>
                        </div>
                      )}
                    </div>
                  </div>

      {/* ── Price + address + quick facts + CTA ──────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* Left: price, address, beds/baths/sqft, monthly est */}
          <div className="min-w-0 flex-1">

            {/* Property type label */}
            {propertyType && (
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#22C55E]">
                {propertyType}
              </p>
            )}

            {/* Market value — large like Zillow */}
            {marketValue != null && (
              <p className="text-[38px] font-black leading-none tracking-tight text-gray-900">
                {formatINRFull(marketValue)}
              </p>
            )}

            {/* Address */}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="font-semibold">{fullAddress}</span>
            </div>

            {/* Monthly estimate */}
            {monthlyEst && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  Est. {formatINR(monthlyEst)}/mo
                </span>
                <span className="rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-bold text-[#16a34a]">
                  Get pre-qualified
                </span>
              </div>
            )}

            {/* Beds · Baths · Sqft — Zillow-style large numbers */}
            {(bedrooms != null || bathrooms != null || area != null) && (
              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
                {bedrooms != null && (
                  <QuickFact value={bedrooms} label="beds" icon={Bed} />
                )}
                {bathrooms != null && (
                  <QuickFact value={bathrooms} label="baths" icon={Bath} />
                )}
                {area != null && (
                  <QuickFact value={area.toLocaleString()} label="sqft" icon={Maximize} />
                )}
              </div>
            )}
          </div>

          {/* Right: edit button only */}
          <div className="flex w-full flex-col gap-3 lg:w-64 lg:flex-shrink-0">
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.2} />
              Edit property
            </button>
          </div>
        </div>

        {/* ── Stat chips row — like Zillow's facts grid ────────────────── */}
        {[propertyType, yearBuilt, lotSize, pricePerSqft, stories, zoning].some((v) => v != null) && (
          <>
            <div className="my-5 h-px bg-gray-100" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {propertyType && (
                <StatChip icon={Home} label="Type" value={propertyType} />
              )}
              {yearBuilt != null && (
                <StatChip icon={Calendar} label="Year built" value={String(yearBuilt)} />
              )}
              {lotSize != null && lotSize > 0 && (
                <StatChip icon={Ruler} label="Lot size" value={`${lotSize.toLocaleString()} sqft`} />
              )}
              {pricePerSqft != null && (
                <StatChip icon={DollarSign} label="Price/sqft" value={`₹${pricePerSqft.toLocaleString("en-IN")}`} />
              )}
              {stories != null && (
                <StatChip icon={Layers} label="Stories" value={`${stories} ${stories === 1 ? "story" : "stories"}`} />
              )}
              {zoning && (
                <StatChip icon={Building2} label="Zoning" value={zoning} />
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

// ── Helper components ─────────────────────────────────────────────────────────

function QuickFact({ value, label, icon: Icon }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[32px] font-black leading-none tracking-tight text-gray-900 tabular-nums">
          {value}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1 border-b border-dashed border-gray-300 pb-0.5">
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" strokeWidth={1.8} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="truncate text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
