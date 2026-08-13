"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Home, DollarSign, Maximize, ChevronRight } from "lucide-react";
import Card from "../common/Card";
import PropertyLabelsStack from "./PropertyLabelsStack";
import FraudAlertBadge from "./FraudAlertBadge";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { translatePropertyType } from "@/utils/enumTranslations";
import { getPropertyRisk } from "@/services/propertyService";

export default function PropertyCard({ property, isSelected, onSelect }) {
  const { t } = useTranslation();
  const { labels } = usePropertyLabels(property?.id);

  // ── Risk level lookup (lazy — only fetches once per card mount) ─────────
  const [riskLevel, setRiskLevel] = useState(null);

  useEffect(() => {
    if (!property?.id) return;
    let cancelled = false;

    getPropertyRisk(property.id)
      .then((data) => {
        if (!cancelled && data?.overallLevel) {
          setRiskLevel(data.overallLevel);
        }
      })
      .catch(() => {
        // Silent — no badge if risk data unavailable
      });

    return () => {
      cancelled = true;
    };
  }, [property?.id]);

  if (!property) return null;

  const address = property.address || t("property.card.unknownAddress", "Unknown Address");
  const city = property.city || "";
  const state = property.state || "";
  const zipCode = property.zipCode || "";
  const marketValue = property.marketValue;
  const area = property.area;
  const propertyType = property.propertyType;

  const locationParts = [city, state, zipCode].filter(Boolean);
  const locationLine = locationParts
    .join(", ")
    .replace(", " + zipCode, " " + zipCode);

  return (
    <motion.div
      onClick={() => onSelect?.(property)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isSelected ? "ring-2 ring-[#22C55E] rounded-xl" : ""
      }`}
    >
      <Card
        className={`p-4 relative overflow-visible ${
          isSelected ? "border-[#22C55E]" : "border-gray-200 dark:border-[#30363d]"
        }`}
      >
        {/* ⭐ Fraud badge — top-right corner, floats over card */}
        {riskLevel && (
          <div className="absolute -top-2 -right-2 z-10">
            <FraudAlertBadge score={riskLevel} size="sm" />
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-2">
              <Home className="h-4 w-4 text-gray-400 dark:text-[#7d8590] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-[#e6edf3] line-clamp-1">
                  {address}
                </h3>
                {locationLine && (
                  <p className="text-sm text-gray-500 dark:text-[#7d8590] flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{locationLine}</span>
                  </p>
                )}
              </div>
            </div>

            {labels.length > 0 && (
              <div className="mt-2.5">
                <PropertyLabelsStack
                  labels={labels}
                  position="inline"
                  size="sm"
                  maxVisible={3}
                />
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-[#7d8590]">
                <DollarSign className="h-3 w-3 mr-1 text-green-600 flex-shrink-0" />
                <span className="truncate">
                  {marketValue != null ? `$${marketValue.toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-[#7d8590]">
                <Maximize className="h-3 w-3 mr-1 text-[#22C55E] flex-shrink-0" />
                <span className="truncate">
                  {area || "N/A"} {t("property.card.sqft", "sqft")}
                </span>
              </div>
            </div>

            {propertyType && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-gray-100 dark:bg-[#1c2128] text-gray-600 dark:text-[#7d8590] text-xs rounded-full">
                {translatePropertyType(t, propertyType)}
              </span>
            )}
          </div>

          <ChevronRight
            className={`h-5 w-5 flex-shrink-0 transition ${
              isSelected ? "text-[#22C55E]" : "text-gray-300 dark:text-[#6e7681]"
            }`}
          />
        </div>
      </Card>
    </motion.div>
  );
}