"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { callStartExamApi } from "@/lib/exams/start-exam";

export default function PracticeExamStartPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
          router.replace(`/practice-exams/${lang}/attempt/${result.attemptId}`);
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

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Preparing your exam…
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We&apos;re selecting your questions at random. This may take a few seconds.
        </p>
        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
