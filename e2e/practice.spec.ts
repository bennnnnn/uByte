import { test, expect } from "@playwright/test";

/**
 * uByte is tutorials-only. Legacy practice / interview / daily URLs redirect to the tutorial hub.
 */
test.describe("Legacy non-tutorial routes redirect", () => {
  test("/practice redirects to tutorials", async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/\/tutorial/);
  });

  test("/practice/go redirects to Go tutorials", async ({ page }) => {
    await page.goto("/practice/go");
    await expect(page).toHaveURL(/\/tutorial\/go/);
  });

  test("/practice/go/two-sum redirects away from practice path", async ({ page }) => {
    await page.goto("/practice/go/two-sum");
    await expect(page).toHaveURL(/\/tutorial\//);
    await expect(page).not.toHaveURL(/\/practice\//);
  });

  test("/interview redirects to tutorials", async ({ page }) => {
    await page.goto("/interview");
    await expect(page).toHaveURL(/\/tutorial/);
  });

  test("/daily redirects to tutorials", async ({ page }) => {
    await page.goto("/daily");
    await expect(page).toHaveURL(/\/tutorial/);
  });

  test("leaderboard still loads", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/leaderboard/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
