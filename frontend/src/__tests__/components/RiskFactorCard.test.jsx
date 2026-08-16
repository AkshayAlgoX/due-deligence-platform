import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RiskFactorCard from "@/components/risk/RiskFactorCard";

describe("RiskFactorCard Component", () => {
  const mockFactor = {
    category: "FLOOD",
    score: 65,
    level: "HIGH",
    weight: 0.25,
    explanation: "Property is located in Zone A 100-year flood plain area.",
    recommendation: "Obtain comprehensive flood insurance coverage.",
    dataSource: "FEMA Flood Zone API",
    dataUncertain: true,
  };

  it("renders header elements correctly", () => {
    render(<RiskFactorCard factor={mockFactor} />);

    expect(screen.getByText("FLOOD")).toBeInTheDocument();
    expect(screen.getByText("65.0")).toBeInTheDocument();
    expect(screen.getByText("Data uncertain")).toBeInTheDocument();
  });

  it("expands details section when clicked", () => {
    render(<RiskFactorCard factor={mockFactor} defaultExpanded={false} />);

    expect(screen.queryByText(mockFactor.explanation)).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", { expanded: false });
    fireEvent.click(expandBtn);

    expect(screen.getByText(mockFactor.explanation)).toBeInTheDocument();
    expect(screen.getByText(mockFactor.recommendation)).toBeInTheDocument();
    expect(screen.getByText("FEMA Flood Zone API")).toBeInTheDocument();
  });

  it("renders expanded by default if defaultExpanded is true", () => {
    render(<RiskFactorCard factor={mockFactor} defaultExpanded={true} />);

    expect(screen.getByText(mockFactor.explanation)).toBeInTheDocument();
    expect(screen.getByText(mockFactor.recommendation)).toBeInTheDocument();
  });

  it("returns null if factor prop is missing", () => {
    const { container } = render(<RiskFactorCard factor={null} />);
    expect(container.firstChild).toBeNull();
  });
});
