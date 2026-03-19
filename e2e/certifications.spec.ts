import { test, expect } from "@playwright/test";

test.describe("Certification exams", () => {
  test("certifications listing page loads", async ({ page }) => {
    await page.goto("/certifications");
    await expect(page).toHaveURL(/certifications/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Go certification detail page loads", async ({ page }) => {
    await page.goto("/certifications/go");
    await expect(page).toHaveURL(/certifications\/go/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("TypeScript certification detail page loads", async ({ page }) => {
    await page.goto("/certifications/typescript");
    await expect(page).toHaveURL(/certifications\/typescript/);
  });

  test("SQL certification detail page loads", async ({ page }) => {
    await page.goto("/certifications/sql");
    await expect(page).toHaveURL(/certifications\/sql/);
  });

  test("starting exam without auth redirects or shows upgrade wall", async ({ page }) => {
    await page.goto("/certifications/go/start");
    // Should either redirect to login or show an upgrade/auth wall
    const url = page.url();
    const isRedirected = /login|signup/.test(url);
    const hasWall = await page.locator("text=/sign in|log in|upgrade|pro plan/i").first().isVisible().catch(() => false);
    expect(isRedirected || hasWall).toBeTruthy();
  });

  test("certificate verification page works with invalid id", async ({ page }) => {
    const response = await page.goto("/certifications/certificate/invalid-cert-id");
    // Either 404 or shows 'not found' content
    const isNotFound = response?.status() === 404 ||
      await page.locator("text=/not found|invalid|expired/i").first().isVisible().catch(() => false);
    expect(isNotFound).toBeTruthy();
  });
});
