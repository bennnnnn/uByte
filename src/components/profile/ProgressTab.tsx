"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, TextLink } from "@/components/ui";
import type { Stats, LangProgress } from "./types";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  stats: Stats;
  userId?: number;
}

function formatSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ProgressTab({ stats, userId }: Props) {
  const [progressByLang, setProgressByLang] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  const langs = stats.byLanguage ?? [];
  const totalPct = stats.total_tutorials > 0
    ? Math.round((stats.completed_count / stats.total_tutorials) * 100)
    : 0;

  useEffect(() => {
    if (langs.length === 0) { setLoading(false); return; }

    Promise.all(
      langs.map((lp) =>
        fetch(`/api/progress?lang=${lp.lang}`, { credentials: "same-origin" })
          .then((r) => r.json())
          .then((d) => ({ lang: lp.lang, slugs: (d.progress as string[]) ?? [] }))
      )
    )
      .then((results) => {
        const map: Record<string, string[]> = {};
        for (const r of results) map[r.lang] = r.slugs;
        setProgressByLang(map);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">

      {/* Grand total */}
      <Card className="p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.completed_count}
              <span className="text-xl font-normal text-zinc-400"> / {stats.total_tutorials}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              lessons completed across {langs.length} language{langs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{totalPct}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${totalPct}%` }}
          />
        </div>
      </Card>

      {/* Per-language breakdowns */}
      {langs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">By language</h3>
          {langs.map((lp) => (
            <LanguageProgressCard
              key={lp.lang}
              lp={lp}
              slugs={progressByLang[lp.lang] ?? []}
              loading={loading}
              expanded={expandedLang === lp.lang}
              onToggle={() => setExpandedLang((prev) => (prev === lp.lang ? null : lp.lang))}
            />
          ))}
        </div>
      )}

      {fetchError && (
        <Card className="py-10 text-center">
          <p className="text-sm text-zinc-500">Could not load detailed progress. Try refreshing the page.</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && stats.completed_count === 0 && (
        <Card className="py-10 text-center">
          <p className="text-2xl">📚</p>
          <p className="mt-2 text-sm text-zinc-500">No lessons completed yet.</p>
          <TextLink href="/" className="mt-3 inline-block text-sm">
            Start learning →
          </TextLink>
        </Card>
      )}
    </div>
  );
}

function LanguageProgressCard({
  lp,
  slugs,
  loading,
  expanded,
  onToggle,
}: {
  lp: LangProgress;
  slugs: string[];
  loading: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = lp.total > 0 ? Math.round((lp.completed / lp.total) * 100) : 0;
  const isComplete = lp.total > 0 && lp.completed >= lp.total;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        aria-expanded={expanded}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">
          {lp.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{lp.name}</span>
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
              {lp.completed}/{lp.total}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-emerald-500" : "bg-indigo-600"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : slugs.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">
              No lessons completed.{" "}
              <TextLink href={`/tutorial/${lp.lang}`}>Start {lp.name} →</TextLink>
            </p>
          ) : (
            <ul className="space-y-1.5">
              {slugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={tutorialUrl(lp.lang, slug)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-zinc-700 dark:text-zinc-300">{formatSlug(slug)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!loading && lp.completed < lp.total && slugs.length > 0 && (
            <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
              <TextLink href={`/tutorial/${lp.lang}`} className="text-xs">
                Continue {lp.name} ({lp.total - lp.completed} lessons remaining) →
              </TextLink>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
