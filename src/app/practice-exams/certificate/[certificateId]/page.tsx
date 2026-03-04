"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { CertificatePayload } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ExamCertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<CertificatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/practice-exams/certificate/${certificateId}`, {
          credentials: "same-origin",
        });
        const json = await parseJson<CertificatePayload & { error?: string }>(res);
        if (cancelled) return;
        if (!res.ok) {
          setError(getApiErrorMessage(res, json, "Unable to load certificate."));
          return;
        }
        setData(json as CertificatePayload);
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const handleDownload = () => {
    // Use browser print dialog — user can save as PDF.
    window.print();
  };

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="mb-3 text-sm text-red-500">{error}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/profile?tab=overview"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              ← Back to profile
            </Link>
            <Link
              href="/practice-exams"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              ← Back to practice exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center" aria-live="polite" aria-busy="true">
        <p className="text-sm text-zinc-500">Loading certificate…</p>
      </div>
    );
  }

  const langConfig = LANGUAGES[data.lang as SupportedLanguage];

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950 print:bg-white">
      <div className="mb-4 flex w-full max-w-3xl justify-between print:hidden">
        <Link
          href="/profile?tab=overview"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to profile
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Download as PDF
        </button>
      </div>

      <div className="w-full max-w-3xl rounded-2xl border-4 border-indigo-500 bg-white p-10 text-center shadow-2xl dark:border-indigo-600 dark:bg-zinc-900 print:shadow-none">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
          <span className="text-3xl">
            {langConfig?.slug === "go" ? "🐹" : "🎓"}
          </span>
          <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Practice Exam Certificate
        </p>

        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          This certifies that
        </p>

        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {data.name}
        </h1>

        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          has successfully passed the
        </p>

        <p className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {langConfig?.name ?? data.lang} Practice Exam
        </p>

        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          demonstrating proficiency in core concepts and problem solving in{" "}
          {langConfig?.name ?? data.lang}.
        </p>

        <div className="mt-6 flex items-center justify-between text-xs text-zinc-400">
          <span>Certificate ID: {data.id}</span>
          <span>Attempt: {data.attemptId}</span>
          <span>Issued {formatDate(data.passedAt)}</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400 print:hidden">
        Use your browser&apos;s &quot;Save as PDF&quot; option in the print dialog to download a copy.
      </p>
    </div>
  );
}

