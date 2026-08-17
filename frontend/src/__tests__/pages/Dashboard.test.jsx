import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import * as dashboardService from "@/services/dashboardService";
import * as authService from "@/services/authService";
import * as helpers from "@/utils/helpers";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/services/dashboardService", () => ({
  getDashboardStats: vi.fn(),
  getDashboardTrends: vi.fn(),
}));

vi.mock("@/services/authService", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/utils/helpers", () => ({
  getUser: vi.fn(),
}));

// Mock child components that might use Leaflet or complex charts
vi.mock("@/components/dashboard/PortfolioMap", () => ({
  default: () => <div data-testid="portfolio-map">Portfolio Map</div>,
}));

describe("Dashboard Page", () => {
  const mockStats = {
    totalProperties: 42,
    highRiskProperties: 5,
    pendingReports: 3,
    avgRiskScore: 32.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    helpers.getUser.mockReturnValue({ id: 1, role: "BUYER", email: "buyer@example.com" });
    authService.getCurrentUser.mockResolvedValue({ id: 1, role: "BUYER", email: "buyer@example.com" });
    dashboardService.getDashboardStats.mockResolvedValue(mockStats);
    dashboardService.getDashboardTrends.mockResolvedValue({ labels: ["Jan", "Feb"], values: [10, 20] });
  });

  it("redirects admin users to /dashboard/admin", async () => {
    helpers.getUser.mockReturnValue({ id: 99, role: "ADMIN" });
    render(<DashboardPage />);
    expect(mockReplace).toHaveBeenCalledWith("/dashboard/admin");
  });

  it("fetches and displays dashboard stats for regular user", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(dashboardService.getDashboardStats).toHaveBeenCalled();
    });

    expect(screen.getByText("dashboard.stats.totalProperties")).toBeInTheDocument();
  });

  it("allows opening add property modal for buyer", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("property.addProperty")).toBeInTheDocument();
    });

    const addBtn = screen.getByText("property.addProperty");
    fireEvent.click(addBtn);

    expect(screen.getByText("property.addModal.title")).toBeInTheDocument();
  });
});
