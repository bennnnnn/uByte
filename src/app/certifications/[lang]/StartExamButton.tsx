"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { callStartExamApi } from "@/lib/exams/start-exam";

interface Props {
  lang: string;
  langName: string;
  fullWidth?: boolean;
}

export default function StartExamButton({ lang, langName, fullWidth }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callStartExamApi(lang);
      if (result.kind === "redirect") {
        router.push(result.url);
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

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
      >
        {loading ? "Starting exam..." : `Start ${langName} exam`}
      </button>
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
