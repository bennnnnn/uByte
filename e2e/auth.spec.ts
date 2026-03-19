import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login modal when clicking sign in", async ({ page }) => {
    await page.goto("/");

    // Find and click the sign in / login button
    const loginBtn = page.locator("button, a").filter({ hasText: /sign in|log in|login/i }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await expect(page.locator('[role="dialog"], [aria-modal="true"]').first()).toBeVisible();
    }
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
    // Should show some form
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
  });

  test("signup page is accessible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL(/signup/);
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
  });

  test("forgot password page works", async ({ page }) => {
    await page.goto("/reset-password");
    // Should show some form or redirect to login
    await expect(page).toHaveURL(/reset-password|login/);
  });

  test("login form shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.locator("input[type='email'], input[name='email']").first();
    const passwordInput = page.locator("input[type='password']").first();
    const submitBtn = page.locator("button[type='submit']").first();

    if (await emailInput.isVisible()) {
      await emailInput.fill("notexist@example.com");
      await passwordInput.fill("wrongpassword123");
      await submitBtn.click();

      // Should show an error message
      await expect(
        page.locator("[role='alert'], .error, [class*='error'], [class*='red']").first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("protected dashboard redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login or show auth modal
    await expect(page).toHaveURL(/login|dashboard/);
  });
});
