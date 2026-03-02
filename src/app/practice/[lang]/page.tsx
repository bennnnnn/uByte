import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Difficulty } from "@/lib/practice/types";

type Props = { params: Promise<{ lang: string }> };

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hard:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
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

export default async function PracticeLangPage({ params }: Props) {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) notFound();

  const l = lang as SupportedLanguage;
  const config = LANGUAGES[l];
  const problems = getAllPracticeProblems();
  const easy   = problems.filter((p) => p.difficulty === "easy");
  const medium = problems.filter((p) => p.difficulty === "medium");
  const hard   = problems.filter((p) => p.difficulty === "hard");

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-3xl">{LANG_ICONS[lang] ?? "🎯"}</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {config.name} Interview Practice
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {problems.length} problems · sorted by difficulty
            </p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="mb-10 flex flex-wrap gap-2">
          {(["go","python","cpp","javascript","java","rust"] as SupportedLanguage[]).map((l2) => (
            <Link
              key={l2}
              href={`/practice/${l2}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                l2 === l
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              }`}
            >
              {LANG_ICONS[l2]} {LANGUAGES[l2]?.name}
            </Link>
          ))}
        </div>

        {/* Problem sections */}
        {[
          { label: "Easy", items: easy,   badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
          { label: "Medium", items: medium, badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
          { label: "Hard", items: hard,   badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
        ].map(({ label, items, badge }) =>
          items.length > 0 ? (
            <section key={label} className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badge}`}>
                  {label}
                </span>
                <span className="text-sm text-zinc-400">{items.length} problem{items.length !== 1 ? "s" : ""}</span>
              </div>

              <ul className="space-y-2">
                {items.map((p, idx) => (
                  <li key={p.slug}>
                    <Link
                      href={`/practice/${lang}/${p.slug}`}
                      className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 transition-all hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
                    >
                      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-zinc-400">
                        {idx + 1}.
                      </span>
                      <span className="flex-1 font-medium text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                        {p.title}
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                      <svg
                        className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )}

        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link href="/practice" className="text-sm text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400">
            ← All languages
          </Link>
        </div>
      </div>
    </div>
  );
}
