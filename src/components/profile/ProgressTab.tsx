"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, TextLink } from "@/components/ui";
import type { Stats, LangProgress } from "./types";
import { tutorialUrl } from "@/lib/urls";

const PAGE_SIZE = 8;

interface TutorialSummary {
  slug: string;
  title: string;
  completedSteps: number;
  totalSteps: number;
}

interface Props {
  stats: Stats;
  userId?: number; // kept for API compat; not currently used client-side
}

export default function ProgressTab({ stats }: Props) {
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  const langs = stats.byLanguage ?? [];
  const totalPct = stats.total_tutorials > 0
    ? Math.round((stats.completed_count / stats.total_tutorials) * 100)
    : 0;

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
              expanded={expandedLang === lp.lang}
              onToggle={() => setExpandedLang((prev) => (prev === lp.lang ? null : lp.lang))}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {stats.completed_count === 0 && (
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
  expanded,
  onToggle,
}: {
  lp: LangProgress;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [tutorials, setTutorials] = useState<TutorialSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const pct = lp.total > 0 ? Math.round((lp.completed / lp.total) * 100) : 0;
  const isComplete = lp.total > 0 && lp.completed >= lp.total;

  // Fetch per-tutorial step breakdown the first time the card is expanded
  useEffect(() => {
    if (!expanded || tutorials.length > 0 || lp.completed === 0) return;
    setLoading(true);
    fetch(`/api/progress/steps/summary?lang=${lp.lang}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setTutorials(Array.isArray(d.tutorials) ? d.tutorials : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [expanded, lp.lang, lp.completed, tutorials.length]);

  // Pagination
  const totalPages = Math.ceil(tutorials.length / PAGE_SIZE);
  const paginated = tutorials.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
              {lp.completed} / {lp.total} lessons
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
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : lp.completed === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-zinc-400">
              No lessons completed yet.{" "}
              <TextLink href={`/tutorial/${lp.lang}`}>Start {lp.name} →</TextLink>
            </p>
          ) : (
            <>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginated.map((t) => {
                  const done = t.totalSteps > 0 && t.completedSteps >= t.totalSteps;
                  const stepPct = t.totalSteps > 0
                    ? Math.round((t.completedSteps / t.totalSteps) * 100)
                    : 0;
                  return (
                    <li key={t.slug}>
                      <Link
                        href={tutorialUrl(lp.lang, t.slug)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        {/* Done/partial indicator */}
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                        }`}>
                          {done
                            ? <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            : `${stepPct}%`
                          }
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {t.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div
                                className={`h-full rounded-full ${done ? "bg-emerald-500" : "bg-indigo-500"}`}
                                style={{ width: `${stepPct}%` }}
                              />
                            </div>
                            <span className="shrink-0 text-xs text-zinc-400">
                              {t.completedSteps}/{t.totalSteps}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-zinc-400">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Continue CTA */}
              {!isComplete && (
                <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
                  <TextLink href={`/tutorial/${lp.lang}`} className="text-xs">
                    Continue {lp.name} ({lp.total - lp.completed} lessons remaining) →
                  </TextLink>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
