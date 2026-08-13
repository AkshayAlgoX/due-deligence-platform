// src/__tests__/hooks/useRiskAssessment.test.jsx
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getBreakdown: vi.fn(),
  getHistory: vi.fn(),
  recalculate: vi.fn(),
}));

vi.mock("@/services/riskAssessmentService", () => ({
  default: serviceMocks,
}));

import { useRiskAssessment } from "@/hooks/useRiskAssessment";

describe("useRiskAssessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.getBreakdown.mockResolvedValue({
      overallScore: 23,
      overallLevel: "LOW",
    });
    serviceMocks.getHistory.mockResolvedValue({ totalAssessments: 0 });
  });

  it("starts in loading state with no data", () => {
    // Given — fetch is still pending
    // When
    const { result } = renderHook(() => useRiskAssessment(1));

    // Then
    expect(result.current.loading).toBe(true);
    expect(result.current.breakdown).toBeNull();
  });

  it("sets breakdown after a successful fetch", async () => {
    // When
    const { result } = renderHook(() => useRiskAssessment(1));

    // Then
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.breakdown.overallScore).toBe(23);
    expect(result.current.breakdown.overallLevel).toBe("LOW");
  });

  it("sets an error message when the fetch fails", async () => {
    // Given — the service rejects
    serviceMocks.getBreakdown.mockRejectedValue(new Error("boom"));

    // When
    const { result } = renderHook(() => useRiskAssessment(1));

    // Then
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("boom");
    expect(result.current.breakdown).toBeNull();
  });

  it("loads history alongside breakdown when enabled", async () => {
    // When — history requested
    const { result } = renderHook(() => useRiskAssessment(1, { loadHistory: true }));

    // Then
    await waitFor(() => expect(result.current.history).not.toBeNull());
    expect(result.current.history.totalAssessments).toBe(0);
  });
});
