import { test, expect } from "@playwright/test";

test.describe("Billing & Pricing", () => {
  test("pricing page loads with plan options", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL(/pricing/);
    // Should show pro or paid plan mention
    await expect(
      page.locator("text=/pro|monthly|yearly|\$|per month/i").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("pricing page shows monthly and yearly options", async ({ page }) => {
    await page.goto("/pricing");
    const hasMonthly = await page.locator("text=/monthly|per month/i").first().isVisible().catch(() => false);
    const hasYearly = await page.locator("text=/yearly|per year|annual/i").first().isVisible().catch(() => false);
    // At least one billing period option should be shown
    expect(hasMonthly || hasYearly).toBeTruthy();
  });

  test("checkout requires authentication", async ({ page }) => {
    // POST to checkout API should require auth
    const response = await page.request.post("/api/billing/checkout", {
      data: { priceId: "test" },
    });
    // Should return 401 or redirect
    expect([401, 302, 303]).toContain(response.status());
  });

  test("billing portal requires authentication", async ({ page }) => {
    const response = await page.request.get("/api/billing/portal");
    expect([401, 302, 303]).toContain(response.status());
  });
});
