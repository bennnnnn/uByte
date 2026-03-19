import { test, expect } from "@playwright/test";

const LANGUAGES = ["go", "python", "javascript", "java", "cpp", "rust", "csharp", "typescript", "sql"];

test.describe("Tutorial pages", () => {
  for (const lang of LANGUAGES) {
    test(`${lang} tutorial listing page loads`, async ({ page }) => {
      await page.goto(`/tutorial/${lang}`);
      await expect(page).toHaveURL(new RegExp(`tutorial/${lang}`));
      // Should show at least one tutorial link or heading
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible({ timeout: 10_000 });
    });
  }

  test("Go getting-started tutorial page loads", async ({ page }) => {
    await page.goto("/tutorial/go/getting-started");
    await expect(page).toHaveURL(/tutorial\/go\/getting-started/);
    // Code editor should be present
    await expect(page.locator("textarea, [id='code-editor']").first()).toBeVisible({ timeout: 10_000 });
  });

  test("TypeScript getting-started tutorial page loads", async ({ page }) => {
    await page.goto("/tutorial/typescript/getting-started");
    await expect(page).toHaveURL(/tutorial\/typescript\/getting-started/);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
  });

  test("SQL getting-started tutorial page loads", async ({ page }) => {
    await page.goto("/tutorial/sql/getting-started");
    await expect(page).toHaveURL(/tutorial\/sql\/getting-started/);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
  });

  test("non-existent tutorial returns 404", async ({ page }) => {
    const response = await page.goto("/tutorial/go/this-does-not-exist");
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});
