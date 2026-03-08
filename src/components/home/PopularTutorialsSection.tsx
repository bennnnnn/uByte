import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { tutorialUrl } from "@/lib/urls";
import type { PopularTutorial } from "@/lib/db/home-popular";
import SectionHeading from "./SectionHeading";

interface Props {
  tutorials: PopularTutorial[];
}

export default function PopularTutorialsSection({ tutorials }: Props) {
  if (tutorials.length === 0) return null;

  return (
    <section aria-labelledby="popular-tutorials-heading">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeading
          id="popular-tutorials-heading"
          title="Popular tutorials"
          subtitle="Most completed by other learners right now."
          className="mb-0 text-left"
        />
        <Link
          href="/tutorial/go"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((t) => (
          <Link
            key={`${t.lang}:${t.slug}`}
            href={tutorialUrl(t.lang, t.slug)}
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-surface-card p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700 dark:hover:border-indigo-700"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
              {getLangIcon(t.lang)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-800 group-hover:text-indigo-600 dark:text-zinc-200 dark:group-hover:text-indigo-400">
                {t.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 capitalize">{t.lang}</p>
            </div>
            {t.completionCount > 0 && (
              <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                {t.completionCount.toLocaleString()} ✓
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
