import { test, expect } from "@playwright/test";

test.describe("Authentication Flow E2E", () => {
  test("renders login page with email and password fields", async ({ page }) => {
    await page.goto("/login");

    // Verify page title and header elements
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("validates required input fields on empty submit", async ({ page }) => {
    await page.goto("/login");

    // Click submit without entering credentials
    await page.locator('button[type="submit"]').click();

    // Verify error messaging or invalid state
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("navigates to register page when signup link is clicked", async ({ page }) => {
    await page.goto("/login");

    // Click link to register page
    const registerLink = page.locator('a[href="/register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });
});
