// src/__tests__/components/property/FraudAlertBadge.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import FraudAlertBadge from "@/components/property/FraudAlertBadge";

describe("FraudAlertBadge", () => {
  it("renders the critical badge with a pulsing alert for CRITICAL risk", () => {
    // When
    const { container } = render(<FraudAlertBadge score="CRITICAL" />);

    // Then — label visible and the ping ring is present
    expect(screen.getByText("Critical Risk")).toBeInTheDocument();
    expect(container.querySelector(".animate-ping")).not.toBeNull();
  });

  it("renders the high-risk badge for HIGH risk", () => {
    // When
    render(<FraudAlertBadge score="HIGH" />);

    // Then
    expect(screen.getByText("High Risk")).toBeInTheDocument();
  });

  it("renders nothing for MEDIUM risk", () => {
    // When — medium risk is intentionally quiet
    const { container } = render(<FraudAlertBadge score="MEDIUM" />);

    // Then
    expect(container).toBeEmptyDOMElement();
  });
});
