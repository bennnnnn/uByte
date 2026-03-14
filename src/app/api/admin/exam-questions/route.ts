import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { listExamQuestionsForAdmin } from "@/lib/db/exam-questions";
import { isExamLang } from "@/lib/exams/config";

/** GET /api/admin/exam-questions?lang=go&page=1&limit=50 */
export const GET = withErrorHandling(
  "GET /api/admin/exam-questions",
  async (request: NextRequest) => {
    const { admin, response } = await requireAdmin();
    if (!admin) return response;

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const offset = (page - 1) * limit;

    if (!isExamLang(lang)) {
      return NextResponse.json({ error: `Invalid lang "${lang}"` }, { status: 400 });
    }

    const { rows, total } = await listExamQuestionsForAdmin(lang, limit, offset);
    return NextResponse.json({ rows, total, page, limit });
  }
);
