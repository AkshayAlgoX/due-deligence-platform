import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportsPage from "@/app/reports/page";
import * as useReportHook from "@/hooks/useReport";
import * as useExportHook from "@/hooks/useExport";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/reports",
}));

vi.mock("@/hooks/useReport", () => ({
  useReport: vi.fn(),
}));

vi.mock("@/hooks/useExport", () => ({
  useExport: vi.fn(),
}));

describe("Reports Page", () => {
  const mockReports = [
    {
      id: 1,
      title: "Main St Due Diligence",
      propertyAddress: "100 Main St",
      status: "COMPLETED",
      riskScoreSnapshot: 20,
      createdAt: "2026-08-14T10:00:00Z",
    },
    {
      id: 2,
      title: "Market St Due Diligence",
      propertyAddress: "200 Market St",
      status: "GENERATING",
      riskScoreSnapshot: null,
      createdAt: "2026-08-14T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useReportHook.useReport.mockReturnValue({
      reports: mockReports,
      listLoading: false,
      listError: null,
      fetchList: vi.fn(),
      deleteReport: vi.fn(),
      regenerateReport: vi.fn(),
    });
    useExportHook.useExport.mockReturnValue({
      exportState: { isExporting: false, progress: 0 },
      startPdfExport: vi.fn(),
      startExcelExport: vi.fn(),
    });
  });

  it("renders reports page header and cards", async () => {
    render(<ReportsPage />);

    expect(screen.getByText("My Reports")).toBeInTheDocument();
    expect(screen.getByText("100 Main St")).toBeInTheDocument();
    expect(screen.getByText("200 Market St")).toBeInTheDocument();
  });

  it("renders empty state when no reports exist", () => {
    useReportHook.useReport.mockReturnValue({
      reports: [],
      listLoading: false,
      listError: null,
      fetchList: vi.fn(),
      deleteReport: vi.fn(),
      regenerateReport: vi.fn(),
    });

    render(<ReportsPage />);
    expect(screen.getByText("No reports yet")).toBeInTheDocument();
  });
});
