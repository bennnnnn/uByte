"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { callStartExamApi } from "@/lib/exams/start-exam";
import UpgradeWall from "@/components/UpgradeWall";

interface Props {
  lang: string;
  langName: string;
  fullWidth?: boolean;
  isRetake?: boolean;
}

export default function StartExamButton({ lang, langName, fullWidth, isRetake }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callStartExamApi(lang);
      if (result.kind === "redirect") {
        router.push(result.url);
      } else if (result.kind === "upgrade") {
        setShowUpgrade(true);
      } else if (result.kind === "error") {
        setError(result.message);
      } else {
        router.push(`/certifications/${lang}/attempt/${result.attemptId}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showUpgrade) {
    return (
      <UpgradeWall
        tutorialTitle={`${langName} Certification`}
        subtitle="Upgrade to Pro to take timed certification exams and earn verifiable digital certificates."
        backHref={`/certifications/${lang}`}
        backLabel={`← Back to ${langName} certification`}
        context="certification"
      />
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
            Starting exam…
          </>
        ) : isRetake ? (
          "Retake exam"
        ) : (
          `Start ${langName} exam`
        )}
      </button>
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
