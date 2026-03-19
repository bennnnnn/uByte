import { test, expect } from "@playwright/test";

/**
 * API smoke tests — verify critical endpoints return expected status codes
 * without needing a real user session.
 */
test.describe("API health checks", () => {
  test("health endpoint returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
  });

  test("public stats endpoint returns 200", async ({ request }) => {
    const res = await request.get("/api/stats/public");
    expect(res.status()).toBe(200);
  });

  test("leaderboard API returns 200", async ({ request }) => {
    const res = await request.get("/api/leaderboard");
    expect(res.status()).toBe(200);
  });

  test("home popular content returns 200", async ({ request }) => {
    const res = await request.get("/api/home-popular");
    expect(res.status()).toBe(200);
  });

  test("site settings returns 200", async ({ request }) => {
    const res = await request.get("/api/site-settings");
    expect(res.status()).toBe(200);
  });

  test("auth /me returns 401 when not logged in", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(401);
  });

  test("protected progress API returns 401", async ({ request }) => {
    const res = await request.post("/api/progress", {
      data: { slug: "test", completed: true, lang: "go" },
    });
    expect(res.status()).toBe(401);
  });

  test("admin API returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/admin/stats");
    expect(res.status()).toBe(401);
  });

  test("exam attempt submit requires auth", async ({ request }) => {
    const res = await request.post("/api/certifications/attempt/999/submit", {
      data: { answers: {} },
    });
    expect([401, 404]).toContain(res.status());
  });
});
