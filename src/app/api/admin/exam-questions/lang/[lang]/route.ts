import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { deleteExamQuestionsByLang } from "@/lib/db/exam-questions";
import { isExamLang } from "@/lib/exams/config";
import { verifyCsrf } from "@/lib/csrf";

/** DELETE /api/admin/exam-questions/lang/[lang] — delete ALL questions for a language. */
export const DELETE = withErrorHandling(
  "DELETE /api/admin/exam-questions/lang/[lang]",
  async (request: NextRequest, context?: unknown) => {
    const { admin, response } = await requireAdmin();
    if (!admin) return response;

    const csrfError = await verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

    const { lang } = (context as { params: Promise<{ lang: string }> }).params
      ? await (context as { params: Promise<{ lang: string }> }).params
      : { lang: "" };

    if (!isExamLang(lang)) {
      return NextResponse.json({ error: `Invalid lang "${lang}"` }, { status: 400 });
    }

    const deleted = await deleteExamQuestionsByLang(lang);
    return NextResponse.json({ ok: true, deleted });
  }
);
