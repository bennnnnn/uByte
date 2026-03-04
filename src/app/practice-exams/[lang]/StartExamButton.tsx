"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  lang: string;
  langName: string;
}

export default function StartExamButton({ lang, langName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/practice-exams/${lang}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403 && (data as any)?.code === "upgrade_required") {
        router.push("/pricing");
        return;
      }
      if (!res.ok || !(data as any).attemptId) {
        setError((data as any).error || "Unable to start exam. Please try again.");
        return;
      }

      router.push(`/practice-exams/${lang}/attempt/${(data as any).attemptId}`);
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
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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

