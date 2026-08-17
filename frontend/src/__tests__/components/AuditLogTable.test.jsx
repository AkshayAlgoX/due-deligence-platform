import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AuditLogTable from "@/components/audit/AuditLogTable";

describe("AuditLogTable Component", () => {
  const mockLogs = [
    {
      id: 1,
      userId: 5,
      userName: "John Doe",
      action: "LOGIN",
      entityType: "USER",
      entityId: 5,
      ipAddress: "192.168.1.1",
      createdAt: "2026-08-14T10:00:00Z",
    },
    {
      id: 2,
      userId: 6,
      userName: null,
      action: "PROPERTY_CREATE",
      entityType: "PROPERTY",
      entityId: 101,
      ipAddress: "10.0.0.1",
      createdAt: "2026-08-14T11:00:00Z",
    },
  ];

  it("renders loading state when loading is true", () => {
    render(<AuditLogTable loading={true} />);
    expect(screen.getByText("audit.loading")).toBeInTheDocument();
  });

  it("renders error state when error prop is provided", () => {
    render(<AuditLogTable error="Failed to fetch" />);
    expect(screen.getByText("audit.errors.loadFailed")).toBeInTheDocument();
  });

  it("renders empty state when logs array is empty", () => {
    render(<AuditLogTable logs={[]} />);
    expect(screen.getByText("audit.noResults")).toBeInTheDocument();
  });

  it("renders audit log table with log entries correctly", () => {
    render(<AuditLogTable logs={mockLogs} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
  });

  it("calls onViewDetails callback when View button is clicked", () => {
    const handleViewDetails = vi.fn();
    render(<AuditLogTable logs={mockLogs} onViewDetails={handleViewDetails} />);

    const viewButtons = screen.getAllByRole("button", { name: "audit.columns.view" });
    fireEvent.click(viewButtons[0]);

    expect(handleViewDetails).toHaveBeenCalledWith(mockLogs[0]);
  });
});
