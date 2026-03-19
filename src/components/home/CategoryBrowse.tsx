import Link from "next/link";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import type { SupportedLanguage } from "@/lib/languages/types";

const LANGUAGES: Array<{
  slug: SupportedLanguage;
  icon: string;
  name: string;
  tagline: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isNew?: boolean;
  usedFor: string[];
}> = [
  {
    slug: "go",
    icon: "🐹",
    name: "Go",
    tagline: "Fast, simple, built for the cloud",
    level: "Beginner",
    usedFor: ["Backend APIs", "Cloud services", "CLI tools"],
  },
  {
    slug: "python",
    icon: "🐍",
    name: "Python",
    tagline: "The most beginner-friendly language",
    level: "Beginner",
    usedFor: ["Data science", "Automation", "Backend"],
  },
  {
    slug: "javascript",
    icon: "🟨",
    name: "JavaScript",
    tagline: "The language of the web",
    level: "Beginner",
    usedFor: ["Web apps", "Node.js", "Frontend"],
  },
  {
    slug: "typescript",
    icon: "🔷",
    name: "TypeScript",
    tagline: "JavaScript with types — the industry standard",
    level: "Intermediate",
    isNew: true,
    usedFor: ["React apps", "Node.js APIs", "Large codebases"],
  },
  {
    slug: "java",
    icon: "☕",
    name: "Java",
    tagline: "Runs in millions of enterprises worldwide",
    level: "Intermediate",
    usedFor: ["Enterprise apps", "Android", "Spring Boot"],
  },
  {
    slug: "rust",
    icon: "🦀",
    name: "Rust",
    tagline: "Systems speed, memory safety guaranteed",
    level: "Advanced",
    usedFor: ["Systems software", "WebAssembly", "Game engines"],
  },
  {
    slug: "cpp",
    icon: "⚙️",
    name: "C++",
    tagline: "Maximum performance, total control",
    level: "Advanced",
    usedFor: ["Game dev", "Embedded systems", "Performance-critical"],
  },
  {
    slug: "csharp",
    icon: "💜",
    name: "C#",
    tagline: "Microsoft's powerhouse for .NET & games",
    level: "Intermediate",
    usedFor: ["Unity games", ".NET apps", "Enterprise"],
  },
  {
    slug: "sql",
    icon: "🗄️",
    name: "SQL",
    tagline: "Every developer needs this — seriously",
    level: "Beginner",
    isNew: true,
    usedFor: ["Databases", "Analytics", "Data querying"],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:    "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800",
  Intermediate:"bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800",
  Advanced:    "bg-red-50 text-red-700 ring-red-100 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800",
};

export default function CategoryBrowse() {
  return (
    <section aria-labelledby="languages-heading">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            📚 9 Languages
          </p>
          <h2 id="languages-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Pick a language and start in 30 seconds
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Every track includes tutorials, interview practice, and a free certification exam.
          </p>
        </div>
        <Link
          href="/tutorial/go"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all →
        </Link>
      </div>

      {/* Language grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map(lang => {
          const lessonCount = getTotalLessonCount(lang.slug);
          return (
            <Link
              key={lang.slug}
              href={`/tutorial/${lang.slug}`}
              className="group relative flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
            >
              {/* Icon */}
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-2xl shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-700 dark:ring-zinc-600">
                {lang.icon}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {lang.name}
                  </span>
                  {lang.isNew && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                      New
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${LEVEL_COLORS[lang.level]}`}>
                    {lang.level}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {lang.tagline}
                </p>

                {/* Use cases */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {lang.usedFor.map(use => (
                    <span
                      key={use}
                      className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lesson count — top right */}
              <span className="absolute right-4 top-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                {lessonCount} lessons
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
