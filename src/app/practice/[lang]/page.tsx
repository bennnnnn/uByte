import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllPracticeProblems,
  getCategoryForSlug,
  getCategoryLabel,
  getPracticeCategories,
} from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Difficulty, ProblemCategory } from "@/lib/practice/types";
import { isPracticeProblemFree } from "@/lib/plans";
import { getCurrentUser } from "@/lib/auth";
import { getPracticeAttempts } from "@/lib/db";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";

const PROBLEMS_PER_PAGE = 35;

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string; status?: string }>;
};

export const dynamic = "force-dynamic";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
};

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", cpp: "⚙️", javascript: "🟨", java: "☕", rust: "🦀",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) return { title: "Not found" };
  const name = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;
  return {
    title: `${name} Interview Practice`,
    description: `Solve classic interview coding problems in ${name}. Two Sum, Three Sum, sliding window, dynamic programming and more.`,
  };
}

export async function generateStaticParams() {
  const langs: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];
  return langs.map((lang) => ({ lang }));
}

function getEffectiveCategory(slug: string): ProblemCategory | null {
  return getCategoryForSlug(slug);
}

function sortProblemsByCategoryAndDifficulty<T extends { slug: string; difficulty: Difficulty }>(
  problems: T[],
  categoryOrder: ProblemCategory[]
): T[] {
  return [...problems].sort((a, b) => {
    const ca = getEffectiveCategory(a.slug) ?? ("array" as ProblemCategory);
    const cb = getEffectiveCategory(b.slug) ?? ("array" as ProblemCategory);
    const ia = categoryOrder.indexOf(ca);
    const ib = categoryOrder.indexOf(cb);
    if (ia !== ib) return ia - ib;
    const diffOrder: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
    return diffOrder[a.difficulty] - diffOrder[b.difficulty];
  });
}

export default async function PracticeLangPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!isSupportedLanguage(lang)) notFound();

  const l = lang as SupportedLanguage;
  const config = LANGUAGES[l];
  const allProblems = getAllPracticeProblems();
  const categories = getPracticeCategories();

  const user = await getCurrentUser();
  const attempts: Record<string, PracticeAttemptStatus> = user
    ? await getPracticeAttempts(user.userId)
    : {};
  const solvedCount = Object.values(attempts).filter((s) => s === "solved").length;

  const categoryFilter = sp.category && categories.includes(sp.category as ProblemCategory)
    ? (sp.category as ProblemCategory)
    : null;
  let filtered =
    categoryFilter === null
      ? allProblems
      : allProblems.filter((p) => getEffectiveCategory(p.slug) === categoryFilter);

  const statusFilter = sp.status === "solved" || sp.status === "unsolved" ? sp.status : null;
  if (statusFilter === "solved") {
    filtered = filtered.filter((p) => attempts[p.slug] === "solved");
  } else if (statusFilter === "unsolved") {
    filtered = filtered.filter((p) => attempts[p.slug] !== "solved");
  }

  const categoryOrder = categories;
  const sorted = sortProblemsByCategoryAndDifficulty(filtered, categoryOrder);

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PROBLEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const pageProblems = sorted.slice(start, start + PROBLEMS_PER_PAGE);

  const buildUrl = (opts: { page?: number; category?: string; status?: string }) => {
    const u = new URLSearchParams();
    if (opts.page != null && opts.page !== 1) u.set("page", String(opts.page));
    if (opts.category != null && opts.category !== "") u.set("category", opts.category);
    if (opts.status != null && opts.status !== "") u.set("status", opts.status);
    const q = u.toString();
    return `/practice/${lang}${q ? `?${q}` : ""}`;
  };

  /** Link to a problem from the list; preserves current filters so the problem page sidebar matches. */
  const buildProblemHref = (slug: string) => {
    const q = new URLSearchParams();
    if (categoryFilter) q.set("category", categoryFilter);
    if (statusFilter) q.set("status", statusFilter);
    if (currentPage > 1) q.set("page", String(currentPage));
    const query = q.toString();
    return `/practice/${lang}/${slug}${query ? `?${query}` : ""}`;
  };

  const statusIcon = (slug: string) => {
    const s = attempts[slug];
    if (s === "solved") return "solved";
    if (s === "failed") return "failed";
    return "none";
  };

  return (
    <div className="min-h-full overflow-y-auto">
      {/* Hero header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] -translate-y-1/4 rounded-full bg-indigo-200/40 blur-[120px] dark:bg-indigo-500/10" />
          <div className="absolute -top-20 right-0 h-[320px] w-[320px] translate-x-1/4 rounded-full bg-violet-200/30 blur-[100px] dark:bg-violet-500/10" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-10 sm:py-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">
              {LANG_ICONS[lang] ?? "🎯"}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {config.name} Interview Practice
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {allProblems.length} problems · by category & difficulty
              </p>
              {user && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {solvedCount} of {allProblems.length} solved
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-500"
                        style={{ width: `${allProblems.length ? (solvedCount / allProblems.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex flex-wrap gap-2">
            {(["go", "python", "cpp", "javascript", "java", "rust"] as SupportedLanguage[]).map((l2) => {
              const tabQuery = new URLSearchParams();
              if (categoryFilter) tabQuery.set("category", categoryFilter);
              if (statusFilter) tabQuery.set("status", statusFilter);
              const tabQueryStr = tabQuery.toString();
              return (
              <Link
                key={l2}
                href={`/practice/${l2}${tabQueryStr ? `?${tabQueryStr}` : ""}`}
                scroll={false}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  l2 === l
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                }`}
              >
                {LANG_ICONS[l2]} {LANGUAGES[l2]?.name}
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category + Status filter */}
      <section className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildUrl({ category: "", status: statusFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    categoryFilter === null
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  } dark:border dark:border-zinc-700`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl({ category: cat, status: statusFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    {getCategoryLabel(cat)}
                  </Link>
                ))}
              </div>
            </div>
            {user && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildUrl({ status: "", category: categoryFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === null
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    All
                  </Link>
                  <Link
                    href={buildUrl({ status: "solved", category: categoryFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === "solved"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    ✓ Solved
                  </Link>
                  <Link
                    href={buildUrl({ status: "unsolved", category: categoryFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === "unsolved"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    Not solved
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem list */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {pageProblems.map((p, idx) => {
              const free = isPracticeProblemFree(p.slug);
              const cat = getEffectiveCategory(p.slug);
              const status = statusIcon(p.slug);
              return (
                <li key={p.slug}>
                  <Link
                    href={buildProblemHref(p.slug)}
                    className="group flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-nowrap"
                  >
                    <span className="flex w-6 shrink-0 items-center justify-center" title={status === "solved" ? "Solved" : status === "failed" ? "Attempted" : "Not attempted"}>
                      {status === "solved" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                      ) : status === "failed" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                      )}
                    </span>
                    <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400">
                      {start + idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {p.title}
                    </span>
                    {cat && (
                      <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {getCategoryLabel(cat)}
                      </span>
                    )}
                    {!free && (
                      <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        Pro
                      </span>
                    )}
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLES[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-indigo-500 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 bg-zinc-50/80 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800/50 sm:px-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {start + 1}–{Math.min(start + PROBLEMS_PER_PAGE, sorted.length)} of {sorted.length}
              </p>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl({ page: currentPage - 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                    scroll={false}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                    ← Previous
                  </span>
                )}
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
                    p === currentPage ? (
                      <span
                        key={p}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
                        aria-current="page"
                      >
                        {p}
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl({ page: p, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                        scroll={false}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>
                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl({ page: currentPage + 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                    scroll={false}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                    Next →
                  </span>
                )}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/practice"
            className="text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            ← All languages
          </Link>
        </div>
      </section>
    </div>
  );
}
