import Link from "next/link";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { tutorialLangUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

const NEW_LANGUAGES: Array<{
  slug: SupportedLanguage;
  icon: string;
  name: string;
  tagline: string;
  color: string;
}> = [
  {
    slug: "typescript",
    icon: "🔷",
    name: "TypeScript",
    tagline: "JavaScript with superpowers. Types, interfaces, and generics — master the language behind every major web framework.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200/60 dark:border-blue-800/40",
  },
  {
    slug: "sql",
    icon: "🗄️",
    name: "SQL",
    tagline: "Query real databases from day one. SELECT, JOIN, aggregate, and analyze — skills every developer needs.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200/60 dark:border-emerald-800/40",
  },
];

export default function NewLanguagesSection() {
  return (
    <section aria-labelledby="new-heading">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          ✨ Just launched
        </p>
        <h2 id="new-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Two languages every developer needs in 2025
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {NEW_LANGUAGES.map(lang => {
          const lessonCount = getTotalLessonCount(lang.slug);
          return (
            <Link
              key={lang.slug}
              href={tutorialLangUrl(lang.slug)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${lang.color}`}
            >
              {/* New badge */}
              <span className="absolute right-4 top-4 rounded-full bg-violet-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                New
              </span>

              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-zinc-800">
                  {lang.icon}
                </span>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{lang.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{lessonCount} lessons</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {lang.tagline}
              </p>

              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-indigo-600 transition-[gap] group-hover:gap-2 dark:text-indigo-400">
                <span>Start {lang.name} track</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
