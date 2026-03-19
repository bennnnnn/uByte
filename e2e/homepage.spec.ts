import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows the hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/uByte/i);
    // Hero heading should be visible
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("shows the language cards section", async ({ page }) => {
    await page.goto("/");
    // At least one language card should appear
    await expect(page.locator("a[href*='/tutorial/']").first()).toBeVisible();
  });

  test("shows the navigation header", async ({ page }) => {
    await page.goto("/");
    // Logo / brand link should be present
    await expect(page.locator("header")).toBeVisible();
  });

  test("shows pricing page from nav", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL(/pricing/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("shows tutorial listing for Go", async ({ page }) => {
    await page.goto("/tutorial/go");
    await expect(page).toHaveURL(/tutorial\/go/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("shows TypeScript tutorial listing", async ({ page }) => {
    await page.goto("/tutorial/typescript");
    await expect(page).toHaveURL(/tutorial\/typescript/);
  });

  test("shows SQL tutorial listing", async ({ page }) => {
    await page.goto("/tutorial/sql");
    await expect(page).toHaveURL(/tutorial\/sql/);
  });
});
