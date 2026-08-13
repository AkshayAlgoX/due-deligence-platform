// src/__tests__/components/risk/RiskSpectrum.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import RiskSpectrum from "@/components/risk/RiskSpectrum";

describe("RiskSpectrum", () => {
  it("renders the score level pill and scale labels", () => {
    // When
    render(<RiskSpectrum score={23} level="LOW" />);

    // Then
    expect(screen.getByText("LOW risk")).toBeInTheDocument();
    expect(screen.getByText("out of 100")).toBeInTheDocument();
    expect(screen.getByText("Risk scale")).toBeInTheDocument();
  });

  // jsdom serialises 8-digit hex (#RRGGBB18) as rgba() — 0x18 alpha ≈ 0.094
  it.each([
    ["LOW", "rgba(34, 197, 94, 0.094)"],
    ["MEDIUM", "rgba(245, 158, 11, 0.094)"],
    ["HIGH", "rgba(249, 115, 22, 0.094)"],
  ])("uses the %s color for a %s level", (level, rgba) => {
    // When
    render(<RiskSpectrum score={50} level={level} />);

    // Then — the level pill carries the level's solid color
    const pill = screen.getByText(`${level} risk`).closest("div");
    expect(pill.style.backgroundColor).toBe(rgba);
  });

  it("matches a stable snapshot", () => {
    // When
    const { container } = render(
      <RiskSpectrum
        score={77}
        level="CRITICAL"
        lastCalculatedAt="2026-08-01T10:00:00Z"
      />
    );

    // Then
    expect(container).toMatchSnapshot();
  });
});
