import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyResultCard from "@/components/property/PropertyResultCard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("PropertyResultCard Component", () => {
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
  });

  it("renders property basic details correctly", () => {
    render(<PropertyResultCard property={mockProperty} />);

    expect(screen.getByText("123 Main Street")).toBeInTheDocument();
    expect(screen.getByText(/San Francisco/i)).toBeInTheDocument();
    expect(screen.getByText(/2,400/)).toBeInTheDocument();
  });

  it("renders fallback address when address is missing", () => {
    const propertyWithoutAddress = { ...mockProperty, address: null };
    render(<PropertyResultCard property={propertyWithoutAddress} />);

    expect(screen.getByText("property.card.unknownAddress")).toBeInTheDocument();
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<PropertyResultCard property={mockProperty} onClick={handleClick} />);

    const card = screen.getByText("123 Main Street").closest('[role="button"]');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalled();
  });

  it("applies selection styles when isSelected is true", () => {
    const { container } = render(<PropertyResultCard property={mockProperty} isSelected={true} />);
    const outerDiv = container.firstChild;
    expect(outerDiv.className).toContain("ring-[#22C55E]");
  });

  it("renders risk level badge when riskScore is provided", () => {
    render(
      <PropertyResultCard
        property={mockProperty}
        riskScore={{ overallLevel: "HIGH", overallScore: 75 }}
      />
    );

    expect(screen.getByText(/highRisk/i)).toBeInTheDocument();
  });

  it("returns null if property prop is not provided", () => {
    const { container } = render(<PropertyResultCard property={null} />);
    expect(container.firstChild).toBeNull();
  });
});


