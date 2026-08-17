import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportCard from "@/components/reports/ReportCard";

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@/utils/formatDate", () => ({
  formatRelativeTime: () => "2 hours ago",
  formatAbsoluteDate: () => "Aug 14, 2026",
}));

describe("ReportCard Component", () => {
  const completedReport = {
    id: 42,
    title: "Comprehensive Due Diligence Report",
    propertyAddress: "742 Evergreen Terrace",
    status: "COMPLETED",
    version: 1,
    riskScoreSnapshot: 35,
    createdAt: "2026-08-14T10:00:00Z",
    completedAt: "2026-08-14T10:05:00Z",
    generatedByEmail: "user@example.com",
  };

  const failedReport = {
    ...completedReport,
    id: 43,
    status: "FAILED",
    riskScoreSnapshot: null,
  };

  const generatingReport = {
    ...completedReport,
    id: 44,
    status: "GENERATING",
    riskScoreSnapshot: null,
  };

  const defaultProps = {
    onDownloadPdf: vi.fn(),
    onDownloadExcel: vi.fn(),
    onDelete: vi.fn(),
    onRegenerate: vi.fn(),
    onCopyLink: vi.fn(),
    isExporting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders completed report card details correctly", () => {
    render(<ReportCard report={completedReport} {...defaultProps} />);

    expect(screen.getByText("742 Evergreen Terrace")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("renders status pill for generating report", () => {
    render(<ReportCard report={generatingReport} {...defaultProps} />);
    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("renders status pill for failed report", () => {
    render(<ReportCard report={failedReport} {...defaultProps} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("navigates to report detail page on completed report row click", () => {
    render(<ReportCard report={completedReport} {...defaultProps} />);

    const card = screen.getByRole("button", { name: /View report for 742 Evergreen Terrace/i });
    fireEvent.click(card);

    expect(mockRouterPush).toHaveBeenCalledWith("/reports/42");
  });

  it("renders download action buttons for completed report", () => {
    render(<ReportCard report={completedReport} {...defaultProps} />);

    const pdfBtn = screen.getByTitle("Download PDF");
    expect(pdfBtn).toBeInTheDocument();
    fireEvent.click(pdfBtn);
    expect(defaultProps.onDownloadPdf).toHaveBeenCalledWith(42, expect.any(String));
  });
});
