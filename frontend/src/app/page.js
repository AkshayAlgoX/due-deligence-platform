"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/property/SearchBar";
import FilterPanel from "@/components/property/FilterPanel";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyTable from "@/components/property/PropertyTable";
import PropertyDetails from "@/components/property/PropertyDetails";
import Loader from "@/components/common/Loader";
import { Search, List, LayoutGrid } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties, searchQuery]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties`,
      );
      if (!response.ok) throw new Error("Failed to fetch properties");
      const data = await response.json();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (prop) =>
          prop.address?.toLowerCase().includes(query) ||
          prop.city?.toLowerCase().includes(query) ||
          prop.state?.toLowerCase().includes(query) ||
          prop.zipCode?.includes(query),
      );
    }

    if (filters.city) {
      filtered = filtered.filter((prop) =>
        prop.city?.toLowerCase().includes(filters.city.toLowerCase()),
      );
    }

    if (filters.propertyType) {
      filtered = filtered.filter(
        (prop) =>
          prop.propertyType?.toLowerCase() ===
          filters.propertyType.toLowerCase(),
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (prop) => prop.marketValue >= parseFloat(filters.minPrice),
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (prop) => prop.marketValue <= parseFloat(filters.maxPrice),
      );
    }

    if (filters.minArea) {
      filtered = filtered.filter(
        (prop) => prop.area >= parseFloat(filters.minArea),
      );
    }
    if (filters.maxArea) {
      filtered = filtered.filter(
        (prop) => prop.area <= parseFloat(filters.maxArea),
      );
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const handleClearFilters = () => {
    setFilters({
      city: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
    });
    setSearchQuery("");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Property Search</h1>
          <p className="text-gray-600">
            Find and evaluate properties for due diligence
          </p>
        </div>

        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="text-sm text-gray-600">
            Found{" "}
            <span className="font-semibold text-gray-800">
              {filteredProperties.length}
            </span>{" "}
            properties
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition ${
                viewMode === "card"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              No properties found
            </h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || filters.city
                ? "Try adjusting your search or filters"
                : "Start by searching for a property"}
            </p>
            {(searchQuery || filters.city) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isSelected={selectedProperty?.id === property.id}
                      onSelect={handlePropertySelect}
                    />
                  ))}
                </div>
              ) : (
                <PropertyTable
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  onSelect={handlePropertySelect}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              {selectedProperty ? (
                <PropertyDetails property={selectedProperty} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-700">
                    Select a Property
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Click on any property to see details here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
