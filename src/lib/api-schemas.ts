import { z } from "zod";

export const tutorialRatingBodySchema = z.object({
  rating: z.union([z.literal(1), z.literal(-1)]),
});

export const ratingsBodySchema = z.object({
  slug: z.string().min(1).max(120),
  value: z.union([z.literal(1), z.literal(-1)]),
  lang: z.string().min(1).max(32).optional(),
});

export const adminUserActionSchema = z.object({
  action: z.enum([
    "delete_user",
    "ban_user",
    "unban_user",
    "reset_progress",
    "set_admin",
    "remove_admin",
  ]),
  userId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
});

export const progressStepBodySchema = z.object({
  slug: z.string().min(1).max(120),
  stepIndex: z.number().int().min(0).max(500),
  lang: z.string().min(1).max(32).optional(),
  skipped: z.boolean().optional(),
});

export const stepCheckBodySchema = z.object({
  lang: z.string().min(1).max(32).optional(),
  tutorialSlug: z.string().min(1).max(120),
  stepIndex: z.number().int().min(0).max(500),
  passed: z.boolean(),
});

export const runCodeBodySchema = z.object({
  code: z.string().min(1).max(64 * 1024),
  language: z.string().min(1).max(32).optional(),
});

export const bookmarkBodySchema = z.object({
  tutorialSlug: z.string().min(1).max(120),
  snippet: z.string().min(1).max(16_000),
  note: z.string().max(2000).optional(),
  lang: z.string().min(1).max(32).optional(),
});

export const bookmarkDeleteBodySchema = z.object({
  id: z.number().int().positive(),
});

export const profileUpdateBodySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export const lastActivityBodySchema = z.object({
  type: z.literal("tutorial"),
  lang: z.string().min(1).max(32),
  slug: z.string().min(1).max(120).optional().nullable(),
  step: z.union([z.number().int().min(0).max(500), z.string()]).optional().nullable(),
});

export const progressBodySchema = z.object({
  slug: z.string().min(1).max(200),
  completed: z.boolean(),
  lang: z.string().min(1).max(32).optional(),
});

export const onboardingGoalBodySchema = z.object({
  goal: z.literal("learn-language"),
  lang: z.string().min(1).max(32).optional(),
});

export const tutorialHintBodySchema = z.object({
  tutorialSlug: z.string().min(1).max(120),
  stepIndex: z.number().int().min(0).max(500),
  lang: z.string().min(1).max(32).optional(),
  code: z.string().max(64 * 1024),
  actualOutput: z.string().max(16_000).optional(),
  isError: z.boolean().optional(),
  failureKind: z.enum(["output", "task", "compile"]).nullable().optional(),
});

export const discussionReportBodySchema = z.object({
  reason: z.enum(["spam", "harassment", "inappropriate", "other"]),
});

export function parseUserId(raw: number | string): number {
  return typeof raw === "number" ? raw : parseInt(raw, 10);
}
