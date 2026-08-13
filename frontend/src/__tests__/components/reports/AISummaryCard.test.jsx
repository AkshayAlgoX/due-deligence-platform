// src/__tests__/components/reports/AISummaryCard.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

import AISummaryCard from "@/components/reports/AISummaryCard";

const summaryData = {
  verdict: "PROCEED",
  headline: "Safe purchase detected",
  keyPoints: ["Clean title history"],
  recommendation: "Go ahead with standard checks",
};

describe("AISummaryCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the loading state while the summary is fetched", async () => {
    // Given — fetch resolves only after we've asserted the loading UI
    let resolveFetch;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    // When
    render(<AISummaryCard reportId={1} />);

    // Then — loading UI visible while the request is in flight
    expect(screen.getByText("Analyzing report...")).toBeInTheDocument();

    // Clean up: settle the pending fetch so the test teardown is quiet
    resolveFetch({ ok: true, json: async () => summaryData });
    expect(await screen.findByText("Proceed")).toBeInTheDocument();
  });

  it("renders the verdict pill and headline after a successful fetch", async () => {
    // Given
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => summaryData })
    );

    // When
    render(<AISummaryCard reportId={1} />);

    // Then
    expect(await screen.findByText("Proceed")).toBeInTheDocument();
    expect(screen.getByText("Safe purchase detected")).toBeInTheDocument();
    expect(screen.getByText("Clean title history")).toBeInTheDocument();
  });

  it("disables the regenerate button while regeneration is in flight", async () => {
    // Given — GET resolves, POST stays pending
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => summaryData })
      .mockImplementationOnce(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    // When
    render(<AISummaryCard reportId={1} />);
    await screen.findByText("Proceed");
    await user.click(screen.getByTitle("Regenerate summary"));

    // Then
    await waitFor(() => {
      expect(screen.getByTitle("Regenerate summary")).toBeDisabled();
    });
  });
});
