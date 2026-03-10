import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllProgressByUser } from "@/lib/db/progress";
import { withErrorHandling } from "@/lib/api-utils";

/**
 * GET /api/progress/all
 *
 * Returns completed tutorial slugs for every language in a single DB query.
 * Used by AuthProvider on login so it can track progress for all languages
 * without making one request per language.
 *
 * Response: { progress: { go: string[], rust: string[], ... } }
 */
export const GET = withErrorHandling("GET /api/progress/all", async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: {} });
  }

  const byLang = await getAllProgressByUser(user.userId);

  // Convert Map → plain object for JSON serialisation
  const progress: Record<string, string[]> = {};
  for (const [lang, slugs] of byLang) {
    progress[lang] = slugs;
  }

  return NextResponse.json({ progress });
});
