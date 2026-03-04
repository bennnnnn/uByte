"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Question {
  id: number;
  prompt: string;
  choices: string[];
}

interface AttemptPayload {
  attemptId: string;
  lang: string;
  startedAt: string;
  questions: Question[];
}

export default function PracticeExamAttemptPage() {
  const { lang, attemptId } = useParams<{ lang: string; attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/practice-exams/attempt/${attemptId}`, {
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403) {
          router.replace("/practice-exams");
          return;
        }
        if (!res.ok) {
          setError((data as any).error || "Unable to load exam.");
          return;
        }

        setAttempt(data as AttemptPayload);
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, router]);

  const handleChange = (qid: number, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice-exams/attempt/${attempt.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any).error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const { score, passed, certificateId } = data as {
        score: number;
        passed: boolean;
        certificateId: string | null;
      };

      const params = new URLSearchParams();
      params.set("score", String(score));
      params.set("passed", passed ? "1" : "0");
      if (certificateId) params.set("cert", certificateId);

      router.push(`/practice-exams/${lang}/result/${attempt.attemptId}?${params.toString()}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSwitchLanguage = (nextLang: string) => {
    if (nextLang === lang) return;
    const confirmed = window.confirm(
      "Switching languages will end this attempt and return you to the language landing page. Continue?"
    );
    if (!confirmed) return;
    router.push(`/practice-exams/${nextLang}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading exam…</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-3 text-sm text-red-500">
            {error || "Exam not found."}
          </p>
          <Link
            href="/practice-exams"
            className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400"
          >
            ← Back to practice exams
          </Link>
        </div>
      </div>
    );
  }

  const langConfig = LANGUAGES[attempt.lang as SupportedLanguage];

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Practice exam
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {langConfig?.name ?? attempt.lang} Exam
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              40 multiple-choice questions · 70% to pass
            </p>
          </div>

          {/* Switch language */}
          <div className="flex items-center gap-2">
            <label htmlFor="switch-lang" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Switch language
            </label>
            <select
              id="switch-lang"
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              value={attempt.lang}
              onChange={(e) => handleSwitchLanguage(e.target.value)}
            >
              {(["go", "python", "cpp", "javascript", "java", "rust"] as SupportedLanguage[]).map(
                (l) => (
                  <option key={l} value={l}>
                    {LANGUAGES[l]?.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {attempt.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                <span className="mr-1.5 text-xs text-zinc-400">Q{idx + 1}.</span>
                {q.prompt}
              </p>
              <div className="space-y-2">
                {q.choices.map((choice, cIdx) => (
                  <label
                    key={cIdx}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 border-zinc-300 text-amber-600 focus:ring-amber-500"
                      name={`q-${q.id}`}
                      value={cIdx}
                      checked={answers[q.id] === cIdx}
                      onChange={() => handleChange(q.id, cIdx)}
                    />
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {choice}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

