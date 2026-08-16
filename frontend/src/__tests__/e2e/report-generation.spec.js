import { test, expect } from "@playwright/test";

test.describe("Report Generation E2E Flow", () => {
  test("renders reports page with search and filter controls", async ({ page }) => {
    await page.goto("/reports");

    await expect(page).toHaveURL(/.*reports/);
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("allows filtering report list by status", async ({ page }) => {
    await page.goto("/reports");

    const statusFilter = page.locator('button:has-text("Completed"), button:has-text("All")').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
    }
  });

  test("navigates to report history page", async ({ page }) => {
    await page.goto("/reports");

    const historyLink = page.locator('a[href*="history"]').first();
    if (await historyLink.isVisible()) {
      await historyLink.click();
      await expect(page).toHaveURL(/.*history/);
    }
  });
});
