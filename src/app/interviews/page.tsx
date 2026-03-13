import Link from "next/link";
import { getApprovedExperiences, countApprovedExperiences } from "@/lib/db/interview-experiences";
import type { Difficulty, Outcome } from "@/lib/db/interview-experiences";
import VoteButton from "./VoteButton";

export const metadata = {
  title: "Interview Experiences · uByte",
  description: "Real developer interview experiences shared anonymously. Learn what to expect at top tech companies.",
};

/* ── Constants ──────────────────────────────────────────────────────────── */
const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const OUTCOME_LABEL: Record<Outcome, string>        = { offer: "Got offer", rejection: "Rejected", ongoing: "Ongoing", ghosted: "Ghosted" };
const DIFFICULTY_COLOR: Record<Difficulty, string>  = {
  easy:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard:   "bg-red-50 text-red-700 border-red-200",
};
const OUTCOME_COLOR: Record<Outcome, string> = {
  offer:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejection: "bg-red-50 text-red-700 border-red-200",
  ongoing:   "bg-blue-50 text-blue-700 border-blue-200",
  ghosted:   "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ company?: string; difficulty?: string; outcome?: string; page?: string }>;
}

export default async function InterviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const company    = params.company?.trim() || undefined;
  const difficulty = params.difficulty as Difficulty | undefined;
  const outcome    = params.outcome    as Outcome    | undefined;
  const page       = Math.max(1, parseInt(params.page ?? "1", 10));

  const [experiences, total] = await Promise.all([
    getApprovedExperiences({ company, difficulty, outcome, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countApprovedExperiences({ company, difficulty, outcome }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!(company || difficulty || outcome);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Interview Experiences</h1>
          <Link
            href="/interviews/submit"
            className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Share yours →
          </Link>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Real developer interviews shared anonymously. {total > 0 && <span>{total} experience{total !== 1 ? "s" : ""} so far.</span>}
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="company"
          defaultValue={company ?? ""}
          placeholder="Filter by company…"
          className="flex-1 min-w-[160px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <select
          name="difficulty"
          defaultValue={difficulty ?? ""}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          name="outcome"
          defaultValue={outcome ?? ""}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value="">All outcomes</option>
          <option value="offer">Got offer</option>
          <option value="rejection">Rejected</option>
          <option value="ongoing">Ongoing</option>
          <option value="ghosted">Ghosted</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Filter
        </button>
        {hasFilters && (
          <Link href="/interviews" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:hover:text-zinc-300">
            Clear
          </Link>
        )}
      </form>

      {/* Experience cards */}
      {experiences.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {hasFilters ? "No experiences match your filters." : "No interview experiences yet."}{" "}
            <Link href="/interviews/submit" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Be the first to share!
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <article
              key={exp.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Company + role + badges */}
              <div className="mb-3 flex flex-wrap items-start gap-2">
                <div className="flex-1">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {exp.company}
                    <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">— {exp.role}</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {exp.anonymous ? "Anonymous" : (exp.author_name ?? "Anonymous")}
                    {" · "}
                    {new Date(exp.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[exp.difficulty]}`}>
                    {DIFFICULTY_LABEL[exp.difficulty]}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${OUTCOME_COLOR[exp.outcome]}`}>
                    {OUTCOME_LABEL[exp.outcome]}
                  </span>
                </div>
              </div>

              {/* Rounds */}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Interview Rounds</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{exp.rounds}</p>
              </div>

              {/* Tips */}
              {exp.tips && (
                <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">Tips</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-indigo-800 dark:text-indigo-300">{exp.tips}</p>
                </div>
              )}

              {/* Helpful vote button */}
              <VoteButton experienceId={exp.id} initialScore={exp.vote_score} />
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/interviews?${new URLSearchParams({ ...(company ? { company } : {}), ...(difficulty ? { difficulty } : {}), ...(outcome ? { outcome } : {}), page: String(page - 1) })}`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/interviews?${new URLSearchParams({ ...(company ? { company } : {}), ...(difficulty ? { difficulty } : {}), ...(outcome ? { outcome } : {}), page: String(page + 1) })}`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {/* CTA */}
      {experiences.length > 0 && (
        <div className="mt-10 rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-5 text-center dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <p className="mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-200">Had a tech interview recently?</p>
          <p className="mb-4 text-xs text-indigo-700 dark:text-indigo-400">Help other developers by sharing your experience — completely anonymous if you prefer.</p>
          <Link
            href="/interviews/submit"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Share your experience
          </Link>
        </div>
      )}
    </div>
  );
}
