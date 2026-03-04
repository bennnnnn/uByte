"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PracticeExamStartPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function startExam() {
      try {
        const res = await fetch(`/api/practice-exams/${lang}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403 && (data as any)?.code === "upgrade_required") {
          router.replace("/pricing");
          return;
        }
        if (!res.ok || !(data as any).attemptId) {
          setError((data as any).error || "Unable to start exam. Please try again.");
          return;
        }

        router.replace(`/practice-exams/${lang}/attempt/${(data as any).attemptId}`);
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
          We&apos;re selecting 40 questions at random. This may take a few seconds.
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

