import { test, expect } from "@playwright/test";

test.describe("Practice / Interview prep", () => {
  test("practice listing page loads", async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/practice/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("practice Go listing page loads", async ({ page }) => {
    await page.goto("/practice/go");
    await expect(page).toHaveURL(/practice\/go/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("two-sum problem page loads", async ({ page }) => {
    await page.goto("/practice/go/two-sum");
    await expect(page).toHaveURL(/practice\/go\/two-sum/);
    // Problem description should be visible
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
  });

  test("interview simulator page loads", async ({ page }) => {
    await page.goto("/interview");
    await expect(page).toHaveURL(/interview/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("leaderboard page loads", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/leaderboard/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("daily challenge page loads", async ({ page }) => {
    await page.goto("/daily");
    await expect(page).toHaveURL(/daily/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
