"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function PracticeExamResultPage() {
  const { lang, attemptId } = useParams<{ lang: string; attemptId: string }>();
  const search = useSearchParams();

  const score = Number(search.get("score") ?? "0");
  const passed = search.get("passed") === "1";
  const certificateId = search.get("cert");

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/practice-exams/${lang}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          ← Back to exam landing
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Exam result
        </h1>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Attempt ID: <span className="font-mono text-xs">{attemptId}</span>
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Your score</p>
          <p className="mt-1 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {isNaN(score) ? "—" : `${score}%`}
          </p>
          <p className="mt-3 text-sm font-medium">
            {passed ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✅ You passed! A score of 70% or higher is required to earn a certificate.
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                ❌ You didn&apos;t reach 70%. Review the material and try again.
              </span>
            )}
          </p>
        </div>

        {passed && certificateId && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              🎓 Certificate unlocked
            </p>
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
              You can download your certificate anytime from your profile, or directly here.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/practice-exams/certificate/${certificateId}`}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
              >
                Download certificate
              </Link>
              <Link
                href="/profile?tab=overview"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                View in profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

