"use client";

import { useMemo, useState } from "react";

export default function useReportHistory(initialReports = []) {
  const [filters, setFilters] = useState({
    search: "",
    riskLevel: "ALL",
    date: "",
  });

  // =========================================================
  // NORMALIZE RISK LEVEL
  // =========================================================
  const getRiskLevel = (report) => {
    if (!report) {
      return "";
    }

    /*
     * Backend sends riskLevelSnapshot as the primary value.
     * Keep all possible frontend/backend naming variants.
     */
    const rawRisk =
      report?.riskLevelSnapshot ??
      report?.riskLevel ??
      report?.risk_level ??
      report?.riskLevelName ??
      report?.risk_level_name ??
      report?.risk?.level ??
      report?.risk?.riskLevel ??
      "";

    const normalized = String(rawRisk)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    // =======================================================
    // EXPLICIT RISK LEVEL
    // =======================================================

    if (
      normalized === "LOW" ||
      normalized === "LOW_RISK"
    ) {
      return "LOW";
    }

    if (
      normalized === "MEDIUM" ||
      normalized === "MEDIUM_RISK" ||
      normalized === "MODERATE" ||
      normalized === "MODERATE_RISK"
    ) {
      return "MEDIUM";
    }

    if (
      normalized === "HIGH" ||
      normalized === "HIGH_RISK"
    ) {
      return "HIGH";
    }

    if (
      normalized === "CRITICAL" ||
      normalized === "CRITICAL_RISK"
    ) {
      return "CRITICAL";
    }

    // =======================================================
    // FALLBACK TO RISK SCORE
    // =======================================================

    const rawScore =
      report?.riskScoreSnapshot ??
      report?.riskScore ??
      report?.risk_score ??
      report?.score ??
      report?.risk?.score ??
      report?.risk?.riskScore;

    const score = Number(rawScore);

    if (Number.isFinite(score)) {
      if (score <= 25) {
        return "LOW";
      }

      if (score <= 50) {
        return "MEDIUM";
      }

      if (score <= 75) {
        return "HIGH";
      }

      if (score <= 100) {
        return "CRITICAL";
      }
    }

    return "";
  };

  // =========================================================
  // FILTER REPORTS
  // =========================================================
  const filteredReports = useMemo(() => {
    return initialReports.filter((report) => {
      // -----------------------------------------------------
      // Searchable fields
      // -----------------------------------------------------

      const title = String(
        report?.title ??
          report?.name ??
          ""
      );

      const propertyName = String(
        report?.propertyAddress ??
          report?.propertyName ??
          report?.property_name ??
          report?.property?.address ??
          report?.property?.name ??
          ""
      );

      // -----------------------------------------------------
      // Risk
      // -----------------------------------------------------

      const riskLevel = getRiskLevel(report);

      // -----------------------------------------------------
      // Date
      // -----------------------------------------------------

      const createdAt =
        report?.createdAt ??
        report?.created_at ??
        "";

      // -----------------------------------------------------
      // Search filter
      // -----------------------------------------------------

      const searchText = String(
        filters?.search ?? ""
      )
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        title.toLowerCase().includes(searchText) ||
        propertyName.toLowerCase().includes(searchText);

      // -----------------------------------------------------
      // Risk filter
      // -----------------------------------------------------

      const selectedRisk = String(
        filters?.riskLevel ?? "ALL"
      )
        .trim()
        .toUpperCase();

      const matchesRisk =
        selectedRisk === "ALL" ||
        riskLevel === selectedRisk;

      // -----------------------------------------------------
      // Date filter
      // -----------------------------------------------------

      const matchesDate =
        !filters?.date ||
        String(createdAt).startsWith(filters.date);

      return (
        matchesSearch &&
        matchesRisk &&
        matchesDate
      );
    });
  }, [initialReports, filters]);

  // =========================================================
  // RESET
  // =========================================================
  const resetFilters = () => {
    setFilters({
      search: "",
      riskLevel: "ALL",
      date: "",
    });
  };

  return {
    reports: filteredReports,
    filters,
    setFilters,
    resetFilters,
  };
}