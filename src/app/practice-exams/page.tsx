import type { Metadata } from "next";
import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practice Exams",
  description:
    "Timed multiple-choice practice exams by language. Pass to earn a certificate. Available for Pro members.",
};

const LANG_ICONS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
};

export default async function PracticeExamsPage() {
  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";

  if (!hasPaidAccess(plan)) {
    return (
      <UpgradeWall
        tutorialTitle="Practice Exams"
        subtitle="Practice exams and certificates are available on Pro. Upgrade to take timed MCQ exams and earn certificates."
        backHref="/"
        backLabel="← Back to home"
      />
    );
  }

  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Practice Exams
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Timed multiple-choice exams by language. Each attempt selects 40 questions at random. Score
            at least 70% to pass and earn a certificate.
          </p>
        </div>

        <section aria-labelledby="exam-lang-heading">
          <h2
            id="exam-lang-heading"
            className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Choose a language
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {langSlugs.map((slug) => {
              const config = LANGUAGES[slug];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/practice-exams/${slug}`}
                  className="group flex items-center gap-4 rounded-xl border-2 border-amber-100 bg-amber-50/40 p-5 transition-all hover:border-amber-400 hover:bg-amber-50 hover:shadow-md dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:border-amber-600 dark:hover:bg-amber-950/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-zinc-900">
                    {LANG_ICONS[slug] ?? "📝"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {config.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      40 questions · 70% to pass
                    </p>
                  </div>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Start →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

