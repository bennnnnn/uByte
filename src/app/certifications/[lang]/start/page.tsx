"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { callStartExamApi } from "@/lib/exams/start-exam";
import UpgradeWall from "@/components/UpgradeWall";

export default function PracticeExamStartPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function startExam() {
      try {
        const result = await callStartExamApi(lang);
        if (cancelled) return;

        if (result.kind === "redirect") {
          router.replace(result.url);
        } else if (result.kind === "upgrade") {
          setShowUpgrade(true);
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

  if (showUpgrade) {
    return (
      <UpgradeWall
        tutorialTitle={`${lang.charAt(0).toUpperCase() + lang.slice(1)} Certification`}
        subtitle="Certification exams are a Pro feature. Upgrade to take timed exams and earn verifiable certificates."
        backHref={`/certifications/${lang}`}
        backLabel={`← Back to ${lang} certification`}
        context="certification"
      />
    );
  }

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
