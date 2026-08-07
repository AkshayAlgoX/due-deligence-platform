"use client";

import { translatePropertyType } from "@/utils/enumTranslations";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  Ruler,
  Calendar,
  Building,
  Bed,
  Bath,
  Layers,
  UserRound,
  Pencil,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatINRFull } from "@/utils/currency";
import { getPropertyHeroImage } from "@/constants/propertyImages";
import PropertyImagePlaceholder from "./PropertyImagePlaceholder";
import dynamic from "next/dynamic";
import { getUser } from "@/utils/helpers";

const DownloadPDFButton = dynamic(
  () => import("./pdf/DownloadPDFButton"),
  { ssr: false }
);

export default function PropertyDetails({ property, onEdit }) {
  const { t } = useTranslation();

  if (!property) return null;

  const currentUser = getUser();
  const canEdit =
    onEdit &&
    currentUser &&
    (currentUser.role === "ADMIN" ||
      ["BUYER", "REAL_ESTATE_AGENT"].includes(currentUser.role));

  const {
    id,
    address,
    city,
    state,
    zipCode,
    propertyType,
    marketValue,
    area,
    lotSize,
    yearBuilt,
    zoning,
    bedrooms,
    bathrooms,
    stories,
    verified,
  } = property;

  const locationLine = [city, state].filter(Boolean).join(", ");
  const fullAddress = [address, locationLine || null, zipCode || null]
    .filter(Boolean)
    .join(", ")
    .replace(/, ([\d]{6})$/, " $1");

  const quickFacts = [
    bedrooms != null && {
      icon: Bed,
      value: `${bedrooms} ${t("property.details.beds")}`,
    },
    bathrooms != null && {
      icon: Bath,
      value: `${bathrooms} ${t("property.details.baths")}`,
    },
    area != null && area > 0 && {
      icon: Ruler,
      value: `${area.toLocaleString()} ${t("property.details.sqft")}`,
    },
  ].filter(Boolean);

  const stats = [
    yearBuilt != null && {
      icon: Calendar,
      label: t("property.details.yearBuilt"),
      value: String(yearBuilt),
    },
    stories != null && {
      icon: Layers,
      label: t("property.details.stories"),
      value: String(stories),
    },
    lotSize != null && lotSize > 0 && {
      icon: Ruler,
      label: t("property.details.lotSize"),
      value: `${lotSize.toLocaleString()} ${t("property.details.sqft")}`,
    },
    zoning && {
      icon: Building,
      label: t("property.details.zoning"),
      value: zoning,
    },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: Image */}
        <div className="relative min-h-[380px]">
          {getPropertyHeroImage(property) ? (
            <img
              src={getPropertyHeroImage(property)}
              alt={address || t("property.card.propertyFallback")}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <PropertyImagePlaceholder
              propertyType={propertyType}
              size="hero"
            />
          )}

          {/* Verification badge — stays white pill on image */}
          {verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4 text-[#22C55E]" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-800">
                {t("property.details.verifiedProperty")}
              </span>
            </div>
          )}

          {!verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 shadow-md backdrop-blur-sm ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-800">
                {t("property.details.pendingVerification")}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col p-8">
          {/* Property type + data source pill + edit */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {propertyType && (
                <p className="text-xs font-bold uppercase tracking-widest text-[#22C55E] dark:text-green-400">
                  {translatePropertyType(t, propertyType)}
                </p>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-[#1c2128] px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-[#7d8590] ring-1 ring-gray-200 dark:ring-[#30363d]">
                <UserRound className="h-2.5 w-2.5" strokeWidth={2.5} />
                {t("property.details.userProvided")}
              </span>
            </div>

            {/* ── Action buttons row ── */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Generate Report — primary green CTA */}
              <Link
                href={`/properties/${id}/generate-report`}
                onClick={(e) => e.stopPropagation()}
                title={t("property.details.generateReportTooltip", {
                  defaultValue: "Generate a full due diligence report for this property",
                })}
                className="flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-green-500/20 transition-all duration-150 hover:bg-[#16a34a] hover:shadow-green-500/30 active:scale-95"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={2.4} />
                {t("property.details.generateReport", {
                  defaultValue: "Generate Report",
                })}
              </Link>

              {/* Quick PDF — existing DownloadPDFButton, unchanged */}
              <div
                title={t("property.details.quickPdfTooltip", {
                  defaultValue: "Download a quick client-side PDF summary",
                })}
              >
                <DownloadPDFButton property={property} />
              </div>

              {/* Edit Details — admin/agent only, unchanged */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(property)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition-all duration-150 hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-green-400 active:scale-95"
                >
                  <Pencil className="h-3 w-3" strokeWidth={2.4} />
                  {t("property.details.editDetails")}
                </button>
              )}
            </div>
          </div>

          {/* Address + price */}
          <div className="mt-3 flex items-start justify-between gap-6">
            <h2 className="text-[26px] font-black leading-[30px] tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {fullAddress}
            </h2>

            {marketValue != null && marketValue > 0 && (
              <div className="flex-shrink-0 text-right">
                <p className="text-[30px] font-black leading-none tracking-tight text-gray-900 dark:text-[#e6edf3]">
                  {formatINRFull(marketValue)}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
                  {t("property.details.estimatedMarketValue")}
                </p>
              </div>
            )}
          </div>

          {/* Zillow-style quick facts */}
          {quickFacts.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {quickFacts.map((fact, idx) => {
                const Icon = fact.icon;
                return (
                  <React.Fragment key={fact.value}>
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="h-4 w-4 text-gray-400 dark:text-[#7d8590]"
                        strokeWidth={2}
                      />
                      <span className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                        {fact.value}
                      </span>
                    </div>
                    {idx < quickFacts.length - 1 && (
                      <span className="text-gray-300 dark:text-[#30363d]">·</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Stats grid */}
          {stats.length > 0 && (
            <>
              <div className="my-6 h-px bg-gray-100 dark:bg-[#30363d]" />
              <div
                className={`grid gap-6 ${
                  stats.length === 1
                    ? "grid-cols-1"
                    : stats.length === 2
                    ? "grid-cols-2"
                    : stats.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label}>
                      <Icon
                        className="h-4 w-4 text-gray-400 dark:text-[#7d8590]"
                        strokeWidth={2}
                      />
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900 dark:text-[#e6edf3]">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}