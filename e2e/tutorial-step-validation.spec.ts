import { test, expect } from "@playwright/test";

/**
 * Regression: JS getting-started step 8 (case sensitivity) must accept lowercase console.log.
 * Bug: default regex flags "im" treated console.log as Console.log.
 */
test.describe("Tutorial step validation", () => {
  test("JavaScript case-sensitivity step accepts correct console.log", async ({ page }) => {
    await page.goto("/tutorial/javascript/getting-started");

    await expect(page.locator("textarea, [aria-label='Code editor']").first()).toBeVisible({
      timeout: 15_000,
    });

    // Navigate to step 8 (index 7) via step dots if present, or Next button
    for (let i = 0; i < 7; i++) {
      const next = page.getByRole("button", { name: /next step/i });
      if (await next.isVisible().catch(() => false)) {
        await next.click();
        await page.waitForTimeout(300);
      }
    }

    const editor = page.locator("textarea, [aria-label='Code editor']").first();
    await editor.fill('console.log("Hello!");\nconsole.log("World!");');

    const runBtn = page.getByRole("button", { name: /run|submit/i }).first();
    await runBtn.click();

    await expect(page.getByText(/task not complete/i)).not.toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/use lowercase: console\.log/i)).not.toBeVisible({ timeout: 5_000 });
  });
});
