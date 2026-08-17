import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuditLogsPage from "@/app/dashboard/audit-logs/page";
import useAuditLogs from "@/hooks/useAuditLogs";

vi.mock("@/hooks/useAuditLogs", () => ({
  default: vi.fn(),
}));

describe("AuditLogs Page", () => {
  const mockLogs = [
    {
      id: 10,
      userId: 1,
      userName: "Admin User",
      action: "LOGIN",
      entityType: "USER",
      entityId: 1,
      ipAddress: "127.0.0.1",
      createdAt: "2026-08-14T09:00:00Z",
    },
  ];

  const mockUseAuditLogs = {
    logs: mockLogs,
    loading: false,
    detailsLoading: false,
    statsLoading: false,
    exporting: false,
    error: null,
    statistics: { totalEvents: 1, uniqueUsers: 1, criticalActions: 0 },
    filters: { search: "", action: "", entityType: "", dateFrom: "", dateTo: "" },
    updateFilters: vi.fn(),
    clearFilters: vi.fn(),
    fetchLogDetails: vi.fn().mockResolvedValue(mockLogs[0]),
    exportLogs: vi.fn(),
    clearSelectedLog: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuditLogs.mockReturnValue(mockUseAuditLogs);
  });

  it("renders audit logs header and table", () => {
    render(<AuditLogsPage />);

    expect(screen.getByText("audit.title")).toBeInTheDocument();
    expect(screen.getAllByText("Admin User")[0]).toBeInTheDocument();
  });

  it("triggers log details modal when view details button is clicked", async () => {
    render(<AuditLogsPage />);

    const viewButtons = screen.getAllByRole("button", { name: "audit.columns.view" });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(mockUseAuditLogs.fetchLogDetails).toHaveBeenCalledWith(10);
    });
  });
});
