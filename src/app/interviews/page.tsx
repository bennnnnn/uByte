import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { getApprovedExperiences, countApprovedExperiences, getDistinctCompanies } from "@/lib/db/interview-experiences";
import type { Difficulty, Outcome } from "@/lib/db/interview-experiences";
import { getCurrentUser } from "@/lib/auth";
import VoteButton from "./VoteButton";
import ExpandableText from "./ExpandableText";
import InterviewFilters from "./InterviewFilters";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";

// Cache the total count (and company list) for 5 minutes to avoid full scans on every page load.
const getCachedTotal = unstable_cache(
  async (company: string | undefined, difficulty: string | undefined, outcome: string | undefined, search: string | undefined) =>
    countApprovedExperiences({
      company,
      difficulty: difficulty as Difficulty | undefined,
      outcome: outcome as Outcome | undefined,
      search,
    }),
  ["interview-experiences-count"],
  { revalidate: 300, tags: ["interview-experiences"] }
);

const getCachedCompanies = unstable_cache(
  () => getDistinctCompanies(),
  ["interview-experiences-companies"],
  { revalidate: 300, tags: ["interview-experiences"] }
);

export const metadata: Metadata = {
  title: "Developer Interview Experiences — Real Stories from FAANG & Top Companies",
  description:
    "Read real, anonymous developer interview experiences from Google, Meta, Amazon, Apple, Microsoft, Netflix, Stripe, and 20+ top tech companies. See what coding questions get asked, the difficulty level, and whether candidates passed. Filter by company, difficulty, and outcome.",
  keywords: [
    ...SITE_KEYWORDS,
    "developer interview experiences",
    "tech interview questions",
    "software engineer interview",
    "google interview questions",
    "google interview experience",
    "meta interview questions",
    "meta interview experience",
    "amazon interview questions",
    "amazon interview experience",
    "apple interview experience",
    "microsoft interview experience",
    "netflix interview experience",
    "faang interview prep",
    "faang interview questions",
    "tech company interview process",
    "coding interview tips",
    "what to expect in a coding interview",
    "interview experience community",
    "software engineer interview stories",
    "stripe interview experience",
    "uber interview experience",
  ],
  alternates: { canonical: absoluteUrl("/interviews") },
  openGraph: {
    type: "website",
    title: "Developer Interview Experiences — Real FAANG Stories",
    description:
      "Anonymous interview stories from developers at Google, Meta, Amazon, Apple, Microsoft, and 20+ top companies. See what to expect.",
    url: absoluteUrl("/interviews"),
    siteName: APP_NAME,
    locale: "en_US",
    images: [{ url: absoluteUrl("/api/og?title=Interview+Experiences&description=Real+anonymous+stories+from+developers+at+FAANG+and+top+companies"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Interview Experiences",
    description:
      "Real anonymous interview stories from developers at Google, Meta, Amazon, and 20+ top companies. Filter by company, difficulty, and outcome.",
  },
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
  searchParams: Promise<{ company?: string; difficulty?: string; outcome?: string; search?: string; page?: string }>;
}

export default async function InterviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const company    = params.company?.trim()    || undefined;
  const difficulty = (params.difficulty?.trim() || undefined) as Difficulty | undefined;
  const outcome    = (params.outcome?.trim()    || undefined) as Outcome    | undefined;
  const search     = params.search?.trim()     || undefined;
  const page       = Math.max(1, parseInt(params.page ?? "1", 10));

  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  const userId    = user?.userId ?? null;
  const visitorId = cookieStore.get("vid")?.value ?? null;

  const [experiences, total, companies] = await Promise.all([
    getApprovedExperiences({ company, difficulty, outcome, search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, userId, visitorId }),
    getCachedTotal(company, difficulty, outcome, search),
    getCachedCompanies(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!(company || difficulty || outcome || search);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: "Developer Interview Experiences",
    description: "Real developer interview experiences shared anonymously. Learn what to expect at top tech companies.",
    url: absoluteUrl("/interviews"),
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: total,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script async type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
      <InterviewFilters
        companies={companies}
        currentCompany={company ?? ""}
        currentDifficulty={difficulty ?? ""}
        currentOutcome={outcome ?? ""}
        currentSearch={search ?? ""}
      />

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
                    {new Date(exp.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
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
                <ExpandableText
                  text={exp.rounds}
                  className="text-zinc-700 dark:text-zinc-300"
                  labelClassName="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                />
              </div>

              {/* Tips */}
              {exp.tips && (
                <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">Tips</p>
                  <ExpandableText
                    text={exp.tips}
                    className="text-indigo-800 dark:text-indigo-300"
                    labelClassName="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                  />
                </div>
              )}

              {/* Helpful vote button */}
              <VoteButton
                experienceId={exp.id}
                initialScore={exp.vote_score}
                initialVote={(exp.my_vote ?? 0) as 1 | -1 | 0}
              />
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
