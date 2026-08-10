"use client";

import { useMemo, useState } from "react";

export default function useReportHistory(initialReports = []) {
  const [filters, setFilters] = useState({
    search: "",
    riskLevel: "ALL",
    date: "",
  });

  const filteredReports = useMemo(() => {
    return initialReports.filter((report) => {
      const title =
        report.title ||
        report.name ||
        "";

      const propertyName =
        report.propertyAddress ||
        report.propertyName ||
        report.property_name ||
        report.property?.name ||
        "";

      const riskLevel =
        report.riskLevel ||
        report.risk_level ||
        "";

      const createdAt =
        report.createdAt ||
        report.created_at ||
        "";

      // -----------------------------
      // Search filter
      // -----------------------------
      const searchText = filters.search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        title.toLowerCase().includes(searchText) ||
        propertyName.toLowerCase().includes(searchText);

      // -----------------------------
      // Risk filter
      // -----------------------------
      const matchesRisk =
        !filters.riskLevel ||
        filters.riskLevel === "ALL" ||
        riskLevel.toUpperCase() === filters.riskLevel.toUpperCase();

      // -----------------------------
      // Date filter
      // -----------------------------
      const matchesDate =
        !filters.date ||
        String(createdAt).startsWith(filters.date);

      return (
        matchesSearch &&
        matchesRisk &&
        matchesDate
      );
    });
  }, [initialReports, filters]);

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