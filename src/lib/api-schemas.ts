import { z } from "zod";

export const tutorialRatingBodySchema = z.object({
  rating: z.union([z.literal(1), z.literal(-1)]),
});

export const adminUserActionSchema = z.object({
  action: z.enum([
    "delete_user",
    "ban_user",
    "unban_user",
    "reset_progress",
    "set_admin",
    "remove_admin",
    "set_plan",
  ]),
  userId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  plan: z.enum(["free", "pro", "monthly", "yearly"]).optional(),
});

export function parseUserId(raw: number | string): number {
  return typeof raw === "number" ? raw : parseInt(raw, 10);
}
