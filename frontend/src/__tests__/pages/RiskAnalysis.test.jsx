import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RiskAnalysisPage from "@/app/properties/[id]/risk-analysis/page";
import * as useRiskAssessmentHook from "@/hooks/useRiskAssessment";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: "101" }),
}));

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { address: "100 Market St" } }),
  },
}));

vi.mock("@/hooks/useRiskAssessment", () => ({
  useRiskAssessment: vi.fn(),
}));

vi.mock("@/components/risk/RiskBreakdownRadar", () => ({
  default: () => <div data-testid="risk-radar">Risk Radar</div>,
}));

vi.mock("@/components/risk/RiskSpectrum", () => ({
  default: () => <div data-testid="risk-spectrum">Risk Spectrum</div>,
}));

describe("RiskAnalysis Page", () => {
  const mockBreakdown = {
    propertyId: 101,
    overallScore: 42,
    overallLevel: "MEDIUM",
    categories: [
      { category: "FLOOD", score: 30, level: "LOW", weight: 0.25 },
      { category: "LEGAL", score: 55, level: "MEDIUM", weight: 0.35 },
    ],
    factors: [
      { category: "FLOOD", score: 30, level: "LOW", weight: 0.25, explanation: "Low flood hazard" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRiskAssessmentHook.useRiskAssessment.mockReturnValue({
      breakdown: mockBreakdown,
      history: [],
      loading: false,
      error: null,
      recalculating: false,
      recalculate: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it("renders loading state when risk data is loading", () => {
    useRiskAssessmentHook.useRiskAssessment.mockReturnValue({
      breakdown: null,
      history: null,
      loading: true,
      error: null,
      recalculating: false,
      recalculate: vi.fn(),
      refresh: vi.fn(),
    });

    render(<RiskAnalysisPage />);
    expect(screen.getByText(/Analyzing property risk/i)).toBeInTheDocument();
  });

  it("renders risk score, level, and factors when loaded", async () => {
    render(<RiskAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByTestId("risk-spectrum")).toBeInTheDocument();
    });

    expect(screen.getAllByText("FLOOD").length).toBeGreaterThan(0);
  });
});
