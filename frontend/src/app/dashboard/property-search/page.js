"use client";

import { useState } from "react";
import { toast } from "sonner";

import SearchBar from "@/components/property/SearchBar";
import PropertyDetails from "@/components/property/PropertyDetails";
import OwnershipCard from "@/components/property/OwnershipCard";
import TaxHistoryTable from "@/components/property/TaxHistoryTable";
import BuildingInformationCard from "@/components/property/BuildingInformationCard";
import TransactionHistoryTable from "@/components/property/TransactionHistoryTable";
import ActionButtons from "@/components/property/ActionButtons";

// ── Mock data matching the Figma design ────────────────────────────────────
const MOCK_PROPERTY = {
  id: "prop-001",
  address: "742 Evergreen Terrace",
  city: "Springfield",
  state: "OR",
  zipCode: "97477",
  propertyType: "Single Family Residence",
  marketValue: 1450000,
  area: 3250,
  lotSize: "0.45 Acres",
  yearBuilt: 1994,
  zoning: "R-1",
  verified: true,
  imageUrl:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
};

export default function PropertySearchPage() {
  const [selectedProperty, setSelectedProperty] = useState(MOCK_PROPERTY);

  const handleSearch = (query) => {
    if (!query) {
      toast.info("Search cleared");
      return;
    }
    toast.info(`Searching for: ${query}`);
    setSelectedProperty(MOCK_PROPERTY);
  };

  const handleCompare = () => {
    toast.info("Compare Property — coming soon!");
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* ── Unified Header + Search Card (matches Figma) ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
          Property Search
        </h1>
        <p className="mt-1 text-gray-500">
          Validate property addresses and retrieve comprehensive ownership, tax and structural data.
        </p>

        {/* Search bar sits inside the same card, below the header */}
        <div className="mt-6">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Hero property card */}
      <PropertyDetails
        property={selectedProperty}
        onCompare={handleCompare}
      />

      {/* Row 1: Ownership + Tax History */}
      <div className="mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <OwnershipCard />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <TaxHistoryTable />
        </div>
      </div>

      {/* Row 2: Building Info + Transactions */}
      <div className="mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <BuildingInformationCard />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <TransactionHistoryTable />
        </div>
      </div>

      <ActionButtons />
    </div>
  );
}