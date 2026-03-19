"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { callStartExamApi } from "@/lib/exams/start-exam";
import Spinner from "@/components/Spinner";

export default function PracticeExamStartPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const langName = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;

  useEffect(() => {
    let cancelled = false;
    async function startExam() {
      try {
        const result = await callStartExamApi(lang);
        if (cancelled) return;

        if (result.kind === "redirect") {
          router.replace(result.url);
        } else if (result.kind === "error") {
          setError(result.message);
        } else {
          router.replace(`/certifications/${lang}/attempt/${result.attemptId}`);
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      }
    }
    void startExam();
    return () => {
      cancelled = true;
    };
  }, [lang, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="mb-4 text-sm text-red-500 dark:text-red-400">{error}</p>
          <Link
            href={`/certifications/${lang}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            ← Back to {langName} certification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Spinner label="Preparing your exam…" />
        </div>
        <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Preparing your {langName} exam…
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We&apos;re selecting your questions at random. This may take a few seconds.
        </p>
      </div>
    </div>
  );
}
