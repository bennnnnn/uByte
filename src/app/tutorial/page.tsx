import type { Metadata } from "next";
import Link from "next/link";
import { ALL_LANGUAGE_KEYS, LANGUAGES } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import { getTotalLessonCount } from "@/lib/tutorial-steps/index";
import { getAllTutorials } from "@/lib/tutorials";
import { absoluteUrl } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/languages/types";

export const metadata: Metadata = {
  title: "Tutorials — uByte",
  description:
    "Interactive coding tutorials for Go, Python, TypeScript, JavaScript, Java, Rust, C++, C# and SQL. Step-by-step lessons with real code running in your browser.",
  alternates: { canonical: absoluteUrl("/tutorial") },
};

// Difficulty label and style per language — editable as the platform grows
const LANG_META: Record<SupportedLanguage, { difficulty: string; diffStyle: string; tagline: string }> = {
  go:         { difficulty: "Beginner-friendly", diffStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", tagline: "Concurrency, APIs and systems programming"  },
  python:     { difficulty: "Beginner-friendly", diffStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", tagline: "Data, automation and backend development"     },
  javascript: { difficulty: "Beginner-friendly", diffStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", tagline: "Web, Node.js and full-stack development"      },
  typescript: { difficulty: "Intermediate",      diffStyle: "bg-amber-50   text-amber-700   dark:bg-amber-950/40   dark:text-amber-400",   tagline: "Typed JavaScript for large-scale apps"     },
  java:       { difficulty: "Intermediate",      diffStyle: "bg-amber-50   text-amber-700   dark:bg-amber-950/40   dark:text-amber-400",   tagline: "Enterprise software and Android development" },
  rust:       { difficulty: "Advanced",          diffStyle: "bg-red-50     text-red-700     dark:bg-red-950/40     dark:text-red-400",     tagline: "Memory safety, performance and systems"     },
  cpp:        { difficulty: "Advanced",          diffStyle: "bg-red-50     text-red-700     dark:bg-red-950/40     dark:text-red-400",     tagline: "Performance-critical and embedded systems"  },
  csharp:     { difficulty: "Intermediate",      diffStyle: "bg-amber-50   text-amber-700   dark:bg-amber-950/40   dark:text-amber-400",   tagline: ".NET, game dev and desktop applications"   },
  sql:        { difficulty: "Beginner-friendly", diffStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", tagline: "Databases, queries and data analysis"        },
};

export default function TutorialsPage() {
  const langs = ALL_LANGUAGE_KEYS.map((lang) => {
    const config    = LANGUAGES[lang];
    const lessons   = getTotalLessonCount(lang);
    const tutorials = getAllTutorials(lang);
    const meta      = LANG_META[lang];
    return { lang, config, lessons, topicCount: tutorials.length, meta };
  });

  // Group by difficulty for the section headers
  const beginner     = langs.filter(l => l.meta.difficulty === "Beginner-friendly");
  const intermediate = langs.filter(l => l.meta.difficulty === "Intermediate");
  const advanced     = langs.filter(l => l.meta.difficulty === "Advanced");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Interactive tutorials
          </p>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Learn a language.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              Get certified.
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
            Every tutorial runs live in your browser — write real code, see real output, no installs needed.
            Finish a track and take a free certification to prove your skills.
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              { value: `${langs.length}`, label: "Languages" },
              { value: `${langs.reduce((s, l) => s + l.topicCount, 0)}`, label: "Topics" },
              { value: `${langs.reduce((s, l) => s + l.lessons, 0)}+`, label: "Lessons" },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{s.value}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Language grid ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

        <LanguageGroup title="Start here" langs={beginner} />
        <LanguageGroup title="Level up" langs={intermediate} />
        <LanguageGroup title="Master level" langs={advanced} />

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface LangRow {
  lang: SupportedLanguage;
  config: { name: string };
  lessons: number;
  topicCount: number;
  meta: { difficulty: string; diffStyle: string; tagline: string };
}

function LanguageGroup({ title, langs }: { title: string; langs: LangRow[] }) {
  if (langs.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langs.map(({ lang, config, lessons, topicCount, meta }) => (
          <Link
            key={lang}
            href={`/tutorial/${lang}`}
            className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
          >
            {/* Top row: icon + difficulty */}
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl shadow-sm dark:bg-zinc-800">
                {getLangIcon(lang)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.diffStyle}`}>
                {meta.difficulty}
              </span>
            </div>

            {/* Name + tagline */}
            <div>
              <p className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                {config.name}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {meta.tagline}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span>{topicCount} topics</span>
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span>{lessons} lessons</span>
            </div>

            {/* CTA */}
            <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-[gap] group-hover:gap-2 dark:text-indigo-400">
              Start learning
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
