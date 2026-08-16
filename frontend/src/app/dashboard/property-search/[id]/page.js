"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getPropertyById, deleteProperty } from "@/services/propertyService";
import { getAggregatedProperty } from "@/services/aggregationService";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PropertyHeroSkeleton } from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import PropertyDetails from "@/components/property/PropertyDetails";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import RiskScoreCard from "@/components/property/RiskScoreCard";
import EditPropertyModal from "@/components/property/EditPropertyModal";

import OwnershipCard from "@/components/property/aggregation/OwnershipCard";
import TaxHistorySection from "@/components/property/aggregation/TaxHistorySection";
import ZoningCard from "@/components/property/aggregation/ZoningCard";
import FloodZoneCard from "@/components/property/aggregation/FloodZoneCard";
import PermitsSection from "@/components/property/aggregation/PermitsSection";
import EnvironmentalCard from "@/components/property/aggregation/EnvironmentalCard";
import DataCompletenessCard from "@/components/property/aggregation/DataCompletenessCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PropertyLabelsAdmin from "@/components/property/PropertyLabelsAdmin";
import { getUser } from "@/utils/helpers";

// ⭐ AI Assistant
import FloatingChatButton from "@/components/agent/FloatingChatButton";

export default function PropertyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    document.title = t("property.detailPage.pageTitle");
  }, [t]);

  const [property, setProperty] = useState(null);
  const [aggregated, setAggregated] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [loadingAggregated, setLoadingAggregated] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getUser();
    setIsAdmin(user?.role === "ADMIN");
  }, []);

  const loadAggregation = useCallback(
    async (propertyId) => {
      try {
        setLoadingAggregated(true);
        setAggregated(null);
        const data = await getAggregatedProperty(propertyId);
        setAggregated(data);
      } catch (err) {
        toast.error(t("property.detailPage.couldNotLoad"), {
          description: err?.message || t("property.search.tryAgain"),
        });
      } finally {
        setLoadingAggregated(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoadingProperty(true);
        const data = await getPropertyById(id);
        setProperty(data);
        loadAggregation(id);
      } catch (err) {
        toast.error(t("property.detailPage.notFound"), {
          description: err?.message || t("property.detailPage.mayBeRemoved"),
        });
        router.push("/dashboard/property-search");
      } finally {
        setLoadingProperty(false);
      }
    };
    load();
  }, [id, router, loadAggregation, t]);

  const handleEdit = () => setEditModalOpen(true);

  const handleEditSuccess = (updated) => {
    setProperty(updated);
    loadAggregation(updated.id);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProperty(property.id);
      toast.success(
        t("property.details.deleteSuccess", {
          defaultValue: "Property deleted successfully",
        })
      );
      router.push("/dashboard/property-search");
    } catch (err) {
      toast.error(
        t("property.details.deleteFailed", {
          defaultValue: "Failed to delete property",
        }),
        {
          description: err?.message || t("property.search.tryAgain"),
        }
      );
      setDeleting(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-16">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
        <PropertyHeroSkeleton />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-16">
      <Breadcrumbs
        overrides={{
          [id]: property?.address || t("property.card.propertyFallback"),
        }}
      />

      <button
        type="button"
        onClick={() => router.push("/dashboard/property-search")}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-[#7d8590] transition hover:text-gray-900 dark:hover:text-[#e6edf3] cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("property.details.backToSearch")}
      </button>

      <ErrorBoundary>
        <PropertyDetails
          property={property}
          onEdit={handleEdit}
          onDelete={() => setDeleteOpen(true)}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskScoreCard propertyId={property.id} />
            <DataCompletenessCard
              aggregated={aggregated}
              onRefresh={() => loadAggregation(id)}
              refreshing={loadingAggregated}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <OwnershipCard section={aggregated?.ownership} />
            </div>
            <div className="lg:col-span-7">
              <TaxHistorySection section={aggregated?.taxHistory} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ZoningCard section={aggregated?.zoning} />
            <FloodZoneCard section={aggregated?.floodZone} />
          </div>

          <PermitsSection section={aggregated?.permits} />

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

          {isAdmin && (
            <ErrorBoundary>
              <PropertyLabelsAdmin propertyId={property.id} />
            </ErrorBoundary>
          )}
        </div>
      </ErrorBoundary>

      <EditPropertyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={property}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("property.details.deleteTitle", {
          defaultValue: "Delete this property?",
        })}
        description={t("property.details.deleteMessage", {
          defaultValue:
            "This action cannot be undone. All due diligence reports for this property will remain in your history for reference. Property data will be permanently removed.",
        })}
        confirmLabel={t("property.details.deleteConfirm", {
          defaultValue: "Delete",
        })}
        cancelLabel={t("property.details.deleteCancel", {
          defaultValue: "Cancel",
        })}
        variant="danger"
        loading={deleting}
      />

      {/* ⭐ AI Floating Chat — context-aware for this property */}
      <FloatingChatButton
        propertyId={Number(id)}
        propertyAddress={property?.address}
      />
    </div>
  );
}