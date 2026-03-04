import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { insertExamQuestions } from "@/lib/db/exam-questions";
import type { ExamQuestionInsertRow } from "@/lib/db/exam-questions";
import { verifyCsrf } from "@/lib/csrf";
import { isExamLang } from "@/lib/exams/config";

function parseCSV(text: string): ExamQuestionInsertRow[] {
  const rows: ExamQuestionInsertRow[] = [];
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0]?.toLowerCase() ?? "";
  const hasHeader = /lang|prompt|choice|correct|explanation/.test(header);
  const start = hasHeader ? 1 : 0;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    // Simple CSV: allow quoted fields with commas inside
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === "," && !inQuotes) || (c === "\t" && !inQuotes)) {
        parts.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    parts.push(current.trim());
    // Expected: lang, prompt, choice1, choice2, choice3, choice4, correct_index, [explanation]
    if (parts.length < 7) continue;
    const lang = parts[0].replace(/^"|"$/g, "").trim().toLowerCase();
    const prompt = parts[1].replace(/^"|"$/g, "").trim();
    const choices = [parts[2], parts[3], parts[4], parts[5]].map((s) =>
      s.replace(/^"|"$/g, "").trim()
    );
    const correct_index = parseInt(parts[6], 10);
    const explanation = parts[7]?.replace(/^"|"$/g, "").trim() || null;
    if (!isExamLang(lang) || !prompt || choices.some((c) => !c)) continue;
    if (!Number.isInteger(correct_index) || correct_index < 0 || correct_index > 3) continue;
    rows.push({ lang, prompt, choices, correct_index, explanation });
  }
  return rows;
}

export const POST = withErrorHandling(
  "POST /api/admin/exam-questions/upload",
  async (request: NextRequest) => {
    const { admin, response } = await requireAdmin();
    if (!admin) return response;

    const csrfError = await verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

    const contentType = request.headers.get("content-type") ?? "";
    let rows: ExamQuestionInsertRow[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const raw = Array.isArray(body.questions) ? body.questions : Array.isArray(body) ? body : [];
      for (const r of raw) {
        if (r && typeof r.lang === "string" && typeof r.prompt === "string" && Array.isArray(r.choices)) {
          rows.push({
            lang: String(r.lang).toLowerCase(),
            prompt: String(r.prompt),
            choices: r.choices.map((c: unknown) => String(c)),
            correct_index: Number(r.correct_index) ?? 0,
            explanation: r.explanation != null ? String(r.explanation) : null,
          });
        }
      }
    } else if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const text = await request.text();
      rows = parseCSV(text);
    } else {
      return NextResponse.json(
        { error: "Send JSON (application/json) or CSV (text/csv). Body: { questions: [...] } or CSV rows." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No valid questions to insert. Check format." },
        { status: 400 }
      );
    }

    const { inserted, errors } = await insertExamQuestions(rows);
    return NextResponse.json({ inserted, errors });
  }
);
