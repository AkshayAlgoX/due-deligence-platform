// src/__tests__/utils/riskUtils.test.js
import { describe, it, expect } from "vitest";
import {
  scoreToLevel,
  getRiskLevelMeta,
  isHighRisk,
  isCriticalRisk,
  isLowRisk,
} from "@/utils/riskUtils";

describe("riskUtils", () => {
  it("maps scores to levels at all boundaries", () => {
    expect(scoreToLevel(25)).toBe("LOW");
    expect(scoreToLevel(26)).toBe("MEDIUM");
    expect(scoreToLevel(50)).toBe("MEDIUM");
    expect(scoreToLevel(51)).toBe("HIGH");
    expect(scoreToLevel(75)).toBe("HIGH");
    expect(scoreToLevel(76)).toBe("CRITICAL");
  });

  it("handles edge scores 0 and 100", () => {
    expect(scoreToLevel(0)).toBe("LOW");
    expect(scoreToLevel(100)).toBe("CRITICAL");
  });

  it("returns UNKNOWN for null, undefined and non-numeric input", () => {
    expect(scoreToLevel(null)).toBe("UNKNOWN");
    expect(scoreToLevel(undefined)).toBe("UNKNOWN");
    expect(scoreToLevel("abc")).toBe("UNKNOWN");
  });

  it("provides solid colors per level", () => {
    expect(getRiskLevelMeta("LOW").solid).toBe("#22C55E");
    expect(getRiskLevelMeta("HIGH").solid).toBe("#F97316");
    expect(getRiskLevelMeta("CRITICAL").solid).toBe("#EF4444");
    expect(getRiskLevelMeta("NOPE").level).toBe("UNKNOWN");
  });

  it("detects high risk from level strings", () => {
    expect(isHighRisk("HIGH")).toBe(true);
    expect(isHighRisk("CRITICAL")).toBe(true);
    expect(isHighRisk("MEDIUM")).toBe(false);
    expect(isHighRisk(null)).toBe(false);
  });

  it("detects critical and low risk from numeric scores", () => {
    expect(isCriticalRisk(76)).toBe(true);
    expect(isCriticalRisk(70)).toBe(false);
    expect(isLowRisk(25)).toBe(true);
    expect(isLowRisk(26)).toBe(false);
  });
});
