import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { deleteExamQuestion } from "@/lib/db/exam-questions";
import { verifyCsrf } from "@/lib/csrf";

/** DELETE /api/admin/exam-questions/question/[id] */
export const DELETE = withErrorHandling(
  "DELETE /api/admin/exam-questions/question/[id]",
  async (request: NextRequest, context?: unknown) => {
    const { admin, response } = await requireAdmin();
    if (!admin) return response;

    const csrfError = await verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

    const { id } = (context as { params: Promise<{ id: string }> }).params
      ? await (context as { params: Promise<{ id: string }> }).params
      : { id: "" };

    const numId = parseInt(id, 10);
    if (!numId || numId <= 0) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    await deleteExamQuestion(numId);
    return NextResponse.json({ ok: true });
  }
);
