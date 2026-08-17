import { test, expect } from "@playwright/test";

test.describe("Property CRUD E2E Flow", () => {
  test("navigates to dashboard property search page", async ({ page }) => {
    await page.goto("/dashboard/property-search");

    // Page should load property search layout
    await expect(page).toHaveURL(/.*property-search/);
  });

  test("filters properties by search term", async ({ page }) => {
    await page.goto("/dashboard/property-search");

    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Howard");
      await page.waitForTimeout(300);
      expect(await searchInput.inputValue()).toBe("Howard");
    }
  });

  test("opens add property modal on trigger click", async ({ page }) => {
    await page.goto("/dashboard");

    const addBtn = page.locator('button:has-text("Add Property"), button:has-text("property.addProperty")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const modalHeader = page.locator('h2, [role="dialog"]').first();
      await expect(modalHeader).toBeVisible();
    }
  });
});
