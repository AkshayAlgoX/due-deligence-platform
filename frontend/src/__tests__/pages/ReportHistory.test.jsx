import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportHistoryPage from "@/app/dashboard/report-history/page";
import reportService from "@/services/reportService";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/services/reportService", () => ({
  default: {
    list: vi.fn(),
  },
}));

describe("ReportHistory Page", () => {
  const mockHistoryData = [
    {
      id: 50,
      title: "History Report 1",
      propertyAddress: "77 Wall Street",
      status: "COMPLETED",
      createdAt: "2026-08-14T08:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    reportService.list.mockResolvedValue({ content: mockHistoryData });
  });

  it("fetches and renders report history entries", async () => {
    render(<ReportHistoryPage />);

    await waitFor(() => {
      expect(reportService.list).toHaveBeenCalled();
    });

    expect(screen.getByText("History Report 1")).toBeInTheDocument();
  });

  it("renders empty state when no history exists", async () => {
    reportService.list.mockResolvedValue({ content: [] });

    render(<ReportHistoryPage />);

    await waitFor(() => {
      expect(reportService.list).toHaveBeenCalled();
    });

    expect(screen.getByText("No reports found")).toBeInTheDocument();
  });
});
