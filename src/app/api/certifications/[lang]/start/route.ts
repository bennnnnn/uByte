import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getQuestionIdsByLang, getQuestionsByIds } from "@/lib/db/exam-questions";
import { createAttempt } from "@/lib/db/exam-attempts";
import { getExamConfigForLang } from "@/lib/db/exam-settings";
import { withErrorHandling } from "@/lib/api-utils";
import { isExamLang } from "@/lib/exams/config";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** POST /api/certifications/[lang]/start — create attempt, return attemptId + questions (no correct answers). Paid only. */
export const POST = withErrorHandling(
  "POST /api/certifications/[lang]/start",
  async (request: NextRequest, context?: unknown) => {
    const csrfError = verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
    const ip = getClientIp(request.headers);
    const { limited } = await checkRateLimit(`exam-start:${ip}`, 10, 60_000);
    if (limited) return NextResponse.json({ error: "Too many requests. Please wait before starting another exam." }, { status: 429 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to start an exam", code: "login_required" }, { status: 401 });

    const { lang } = (context as { params?: Promise<{ lang: string }> }).params
      ? await (context as { params: Promise<{ lang: string }> }).params
      : { lang: "" };
    if (!isExamLang(lang)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    const { examSize } = await getExamConfigForLang(lang);
    const ids = await getQuestionIdsByLang(lang);
    if (ids.length < examSize) {
      return NextResponse.json(
        { error: "Not enough questions in the bank yet. Try another language." },
        { status: 503 }
      );
    }

    const shuffled = shuffle(ids);
    const selected = shuffled.slice(0, examSize);
    const choicesOrder = selected.map(() => shuffle([0, 1, 2, 3])); // assume 4 choices; adjust if needed
    const attemptId = crypto.randomUUID();

    await createAttempt(attemptId, user.userId, lang, selected, choicesOrder);

    const questions = await getQuestionsByIds(selected, choicesOrder);

    return NextResponse.json({
      attemptId,
      lang,
      questions: questions.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices })),
    });
  }
);
