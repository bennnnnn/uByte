import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, getProgressCount } from "@/lib/db";
import { resolveLanguage, getLanguageConfig } from "@/lib/languages/registry";
import { withErrorHandling } from "@/lib/api-utils";

/**
 * GET /api/certificate/[lang]
 *
 * Returns certificate data for the authenticated user in the given language.
 * Requires the user to have completed at least one tutorial in that language.
 *
 * Response 200: { eligible, name, lang, langName, completedTutorials, issuedAt }
 * Response 401: not authenticated
 * Response 403: no completed tutorials for this language
 */
export const GET = withErrorHandling("GET /api/certificate/[lang]", async (
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lang: rawLang } = await params;
  const lang = resolveLanguage(rawLang);
  const langConfig = getLanguageConfig(lang);

  const [dbUser, completedTutorials] = await Promise.all([
    getUserById(user.userId),
    getProgressCount(user.userId, lang),
  ]);

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (completedTutorials === 0) {
    return NextResponse.json(
      { eligible: false, error: `Complete at least one ${langConfig?.name ?? lang} tutorial to earn your certificate.` },
      { status: 403 }
    );
  }

  return NextResponse.json({
    eligible: true,
    name: dbUser.name,
    lang,
    langName: langConfig?.name ?? lang,
    completedTutorials,
    issuedAt: new Date().toISOString(),
  });
});
