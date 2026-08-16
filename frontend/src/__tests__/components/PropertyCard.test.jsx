import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyCard from "@/components/property/PropertyCard";
import * as propertyService from "@/services/propertyService";

vi.mock("@/services/propertyService", () => ({
  getPropertyRisk: vi.fn(),
}));

vi.mock("@/hooks/usePropertyLabels", () => ({
  usePropertyLabels: () => ({ labels: [], loading: false }),
}));

describe("PropertyCard Component", () => {
  const mockProperty = {
    id: 101,
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    marketValue: 1250000,
    area: 2400,
    propertyType: "COMMERCIAL",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    propertyService.getPropertyRisk.mockResolvedValue({ overallLevel: "HIGH" });
  });

  it("renders property basic details correctly", () => {
    render(<PropertyCard property={mockProperty} />);

    expect(screen.getByText("123 Main Street")).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA 94105/i)).toBeInTheDocument();
    expect(screen.getByText(/12,50,000|1,250,000/)).toBeInTheDocument();
    expect(screen.getByText(/2400/)).toBeInTheDocument();
  });

  it("renders fallback address when address is missing", () => {
    const propertyWithoutAddress = { ...mockProperty, address: null };
    render(<PropertyCard property={propertyWithoutAddress} />);

    expect(screen.getByText("Unknown Address")).toBeInTheDocument();
  });

  it("triggers onSelect callback when clicked", () => {
    const handleSelect = vi.fn();
    render(<PropertyCard property={mockProperty} onSelect={handleSelect} />);

    const card = screen.getByText("123 Main Street").closest("div");
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(mockProperty);
  });

  it("applies selection styles when isSelected is true", () => {
    const { container } = render(<PropertyCard property={mockProperty} isSelected={true} />);
    const outerDiv = container.firstChild;
    expect(outerDiv.className).toContain("ring-2");
    expect(outerDiv.className).toContain("ring-[#22C55E]");
  });

  it("fetches risk level and renders fraud alert badge when available", async () => {
    render(<PropertyCard property={mockProperty} />);

    expect(propertyService.getPropertyRisk).toHaveBeenCalledWith(101);
    await waitFor(() => {
      expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    });
  });

  it("returns null if property prop is not provided", () => {
    const { container } = render(<PropertyCard property={null} />);
    expect(container.firstChild).toBeNull();
  });
});
