import { test, expect } from "@playwright/test";

/**
 * Certification / exam URLs were removed; middleware sends visitors to the tutorial hub.
 */
test.describe("Legacy certification URLs redirect", () => {
  test("/certifications redirects to tutorials", async ({ page }) => {
    await page.goto("/certifications");
    await expect(page).toHaveURL(/\/tutorial/);
  });

  test("/certifications/go redirects to Go tutorials", async ({ page }) => {
    await page.goto("/certifications/go");
    await expect(page).toHaveURL(/\/tutorial\/go/);
  });

  test("/certifications/typescript redirects to TypeScript tutorials", async ({ page }) => {
    await page.goto("/certifications/typescript");
    await expect(page).toHaveURL(/\/tutorial\/typescript/);
  });
});
