"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { ExamResultResponse } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";
import { usePassPercent } from "@/hooks/usePassPercent";
import Spinner from "@/components/Spinner";

export default function PracticeExamResultPage() {
  const { lang, attemptId } = useParams<{ lang: string; attemptId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const passPercent = usePassPercent(lang);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/certifications/attempt/${attemptId}/result`, {
          credentials: "same-origin",
        });
        const data = await parseJson<ExamResultResponse & { error?: string }>(res);
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403 || res.status === 404 || res.status === 400) {
          setError(getApiErrorMessage(res, data, "Result not found or attempt not submitted."));
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError(getApiErrorMessage(res, data, "Unable to load result."));
          setLoading(false);
          return;
        }
        setResult(data as ExamResultResponse);
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
        <Spinner label="Loading result…" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14">
        <p className="mb-4 text-sm text-red-500">{error ?? "Result not found."}</p>
        <Link
          href="/certifications"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          ← Back to certifications
        </Link>
      </div>
    );
  }

  const { score, passed, certificateId, totalQuestions } = result;
  const correctCount = Math.round((score / 100) * totalQuestions);
  const langName = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/certifications/${lang}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          ← Back to {langName} exam
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Exam result
        </h1>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Your score</p>
          <p className="mt-1 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {score}%
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {correctCount} of {totalQuestions} correct
          </p>
          <p className="mt-3 text-sm font-medium">
            {passed ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✅ You passed! A score of {passPercent}% or higher is required to earn a certificate.
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                ❌ You didn&apos;t reach {passPercent}%. Review the material and try again.
              </span>
            )}
          </p>
        </div>

        {passed && certificateId ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              🎓 Certificate unlocked
            </p>
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
              You can view and download your certificate from your profile or here.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/certifications/certificate/${certificateId}`}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
              >
                View certificate
              </Link>
              <Link
                href="/profile?tab=overview"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                Profile
              </Link>
              <a
                href={`${typeof window !== "undefined" ? window.location.origin : ""}/certifications/certificate/${certificateId}`}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                Copy link to share
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Ready to try again?
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Start a new attempt when you&apos;re ready. Questions are randomized each time.
            </p>
            <Link
              href={`/certifications/${lang}`}
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Retake {langName} exam
            </Link>
          </div>
        )}

        <details className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
            Details
          </summary>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            Attempt ID: {attemptId}
          </p>
        </details>
      </div>
    </div>
  );
}
