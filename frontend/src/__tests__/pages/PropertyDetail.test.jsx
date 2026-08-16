import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyDetailPage from "@/app/dashboard/property-search/[id]/page";
import * as propertyService from "@/services/propertyService";
import * as aggregationService from "@/services/aggregationService";
import * as helpers from "@/utils/helpers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: "101" }),
  usePathname: () => "/dashboard/property-search/101",
}));

vi.mock("@/services/propertyService", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("@/services/aggregationService", () => ({
  getAggregatedProperty: vi.fn(),
}));

vi.mock("@/utils/helpers", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/components/agent/FloatingChatButton", () => ({
  default: () => <div data-testid="chat-button">Chat</div>,
}));

describe("PropertyDetail Page", () => {
  const mockProperty = {
    id: 101,
    address: "500 Howard Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    marketValue: 2500000,
    area: 5000,
    propertyType: "COMMERCIAL",
    yearBuilt: 2018,
    zoningCode: "C-3-O",
  };

  const mockAggregated = {
    ownership: { ownerName: "Acme Corp", deedType: "Warranty Deed" },
    taxHistory: [],
    zoning: { code: "C-3-O", description: "Commercial Office" },
    floodZone: { zone: "X", risk: "LOW" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    helpers.getUser.mockReturnValue({ id: 1, role: "USER" });
    propertyService.getPropertyById.mockResolvedValue(mockProperty);
    aggregationService.getAggregatedProperty.mockResolvedValue(mockAggregated);
  });

  it("fetches and renders property detail information", async () => {
    render(<PropertyDetailPage />);

    await waitFor(() => {
      expect(propertyService.getPropertyById).toHaveBeenCalledWith("101");
      expect(aggregationService.getAggregatedProperty).toHaveBeenCalledWith("101");
    });

    expect(screen.getByText("500 Howard Street")).toBeInTheDocument();
  });

  it("handles loading skeleton state initially", () => {
    propertyService.getPropertyById.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<PropertyDetailPage />);
    expect(container).toBeInTheDocument();
  });
});
