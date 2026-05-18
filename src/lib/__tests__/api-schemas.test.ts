import { describe, it, expect } from "vitest";
import {
  ratingsBodySchema,
  progressBodySchema,
  runCodeBodySchema,
  lastActivityBodySchema,
  adminUserActionSchema,
} from "@/lib/api-schemas";

describe("api-schemas", () => {
  it("ratingsBodySchema accepts valid payload", () => {
    const r = ratingsBodySchema.safeParse({ slug: "getting-started", value: 1, lang: "go" });
    expect(r.success).toBe(true);
  });

  it("progressBodySchema rejects missing slug", () => {
    const r = progressBodySchema.safeParse({ completed: true });
    expect(r.success).toBe(false);
  });

  it("runCodeBodySchema rejects empty code", () => {
    const r = runCodeBodySchema.safeParse({ code: "" });
    expect(r.success).toBe(false);
  });

  it("lastActivityBodySchema allows optional slug and step", () => {
    const r = lastActivityBodySchema.safeParse({ type: "tutorial", lang: "go" });
    expect(r.success).toBe(true);
  });

  it("adminUserActionSchema coerces string userId", () => {
    const r = adminUserActionSchema.safeParse({ action: "ban_user", userId: "42" });
    expect(r.success).toBe(true);
  });
});
