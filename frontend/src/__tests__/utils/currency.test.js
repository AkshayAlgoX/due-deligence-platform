// src/__tests__/utils/currency.test.js
import { describe, it, expect } from "vitest";
import { formatINR, formatINRFull } from "@/utils/currency";

describe("currency", () => {
  it("formats basic INR amounts with Indian separators", () => {
    expect(formatINR(1500)).toBe("₹1,500");
  });

  it("converts lakhs with the L suffix", () => {
    expect(formatINR(150000)).toBe("₹1.50 L");
  });

  it("converts crores with the Cr suffix", () => {
    expect(formatINR(15000000)).toBe("₹1.50 Cr");
    expect(formatINR(1500000000)).toBe("₹150.00 Cr");
  });

  it("handles zero and invalid input", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(null)).toBe("₹0");
    expect(formatINR("abc")).toBe("₹0");
  });

  it("handles negatives, decimals and full format", () => {
    expect(formatINR(-1234.5)).toBe("₹-1,234.5");
    expect(formatINRFull(15000000)).toBe("₹1,50,00,000");
  });
});
