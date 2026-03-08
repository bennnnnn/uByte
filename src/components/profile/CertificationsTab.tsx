"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { ExamCertificateRow } from "@/lib/db/exam-certificates";
import type { UserExamLangStats } from "@/lib/db/exam-attempts";

const LANG_META: Record<string, { icon: string; name: string }> = {
  go:         { icon: "🐹", name: "Go" },
  python:     { icon: "🐍", name: "Python" },
  javascript: { icon: "🟨", name: "JavaScript" },
  java:       { icon: "☕", name: "Java" },
  rust:       { icon: "🦀", name: "Rust" },
  cpp:        { icon: "⚙️", name: "C++" },
};

const ALL_LANGS = Object.keys(LANG_META);

interface CertData {
  certificates: ExamCertificateRow[];
  examStats: UserExamLangStats[];
}

export default function CertificationsTab() {
  const [data, setData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile/exam-certificates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setData({ certificates: d.certificates ?? [], examStats: d.examStats ?? [] }))
      .catch(() => setData({ certificates: [], examStats: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { certificates, examStats } = data;
  const statsMap = new Map(examStats.map((s) => [s.lang, s]));
  const certMap = new Map(certificates.map((c) => [c.lang, c]));

  const earned = ALL_LANGS.filter((l) => certMap.has(l));
  const attempted = ALL_LANGS.filter((l) => !certMap.has(l) && statsMap.has(l));
  const notStarted = ALL_LANGS.filter((l) => !certMap.has(l) && !statsMap.has(l));

  return (
    <div className="space-y-8">
      {/* Earned certificates */}
      {earned.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Earned certificates ({earned.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {earned.map((lang) => {
              const cert = certMap.get(lang)!;
              const meta = LANG_META[lang];
              const stat = statsMap.get(lang);
              return (
                <Card key={lang} className="flex items-center gap-4 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl dark:bg-emerald-950/40">
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {meta.name} Certification
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Passed
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {stat?.bestScore != null ? `Best score: ${stat.bestScore}%` : ""}
                      {stat?.bestScore != null && stat?.attemptCount ? " · " : ""}
                      {stat?.attemptCount ? `${stat.attemptCount} attempt${stat.attemptCount > 1 ? "s" : ""}` : ""}
                      {cert.passed_at ? ` · ${new Date(cert.passed_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/certifications/certificate/${cert.id}`}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/api/certifications/certificate/${cert.id}/pdf`}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      PDF
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* In progress (attempted but not certified) */}
      {attempted.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            In progress ({attempted.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {attempted.map((lang) => {
              const meta = LANG_META[lang];
              const stat = statsMap.get(lang)!;
              return (
                <Card key={lang} className="flex items-center gap-4 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl dark:bg-amber-950/40">
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {meta.name} Certification
                      </p>
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {stat.lastPassed === false ? "Not passed" : "Attempted"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {stat.bestScore != null ? `Best score: ${stat.bestScore}%` : ""}
                      {stat.bestScore != null && stat.attemptCount ? " · " : ""}
                      {stat.attemptCount} attempt{stat.attemptCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/certifications/${lang}`}
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Retry
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Suggested (not started) */}
      {notStarted.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {earned.length > 0 || attempted.length > 0 ? "Suggested next" : "Get started"}
          </h3>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {earned.length > 0
              ? "Continue your collection — earn certificates in more languages."
              : "Take a certification exam to earn a verifiable certificate you can share."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notStarted.map((lang) => {
              const meta = LANG_META[lang];
              return (
                <Link
                  key={lang}
                  href={`/certifications/${lang}`}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-surface-card p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{meta.name}</p>
                    <p className="text-xs text-zinc-400">Take certification</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state when everything is certified */}
      {earned.length === ALL_LANGS.length && (
        <Card className="p-8 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">All certifications earned!</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            You&apos;ve completed every available certification. Share them on LinkedIn to showcase your skills.
          </p>
        </Card>
      )}
    </div>
  );
}
