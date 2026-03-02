import Link from "next/link";

const PROBLEMS = [
  { label: "Two Sum", diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Three Sum", diff: "medium", color: "text-amber-600 dark:text-amber-400" },
  { label: "Maximum Subarray", diff: "medium", color: "text-amber-600 dark:text-amber-400" },
  { label: "Trapping Rain Water", diff: "hard", color: "text-red-600 dark:text-red-400" },
  { label: "Valid Parentheses", diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Climbing Stairs", diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
];

const LANGS = [
  { slug: "go",         icon: "🐹", label: "Go" },
  { slug: "python",     icon: "🐍", label: "Python" },
  { slug: "javascript", icon: "🟨", label: "JS" },
  { slug: "java",       icon: "☕", label: "Java" },
  { slug: "rust",       icon: "🦀", label: "Rust" },
  { slug: "cpp",        icon: "⚙️", label: "C++" },
];

export default function PracticeSection() {
  return (
    <section aria-labelledby="practice-heading">
      <div className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/40 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-violet-950/20">
        <div className="grid gap-0 md:grid-cols-[1fr_auto]">
          {/* Left: copy + problem list */}
          <div className="p-6 sm:p-8">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 id="practice-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Ace your interview
              </h2>
            </div>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              Solve classic problems — Two Sum, LRU Cache, Merge Intervals and more — in any language. Same LeetCode-style IDE, built right in.
            </p>

            {/* Problem list preview */}
            <ul className="mb-5 space-y-1.5">
              {PROBLEMS.map((p) => (
                <li key={p.label} className="flex items-center gap-2.5 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.label}</span>
                  <span className={`ml-auto shrink-0 text-xs font-semibold capitalize ${p.color}`}>
                    {p.diff}
                  </span>
                </li>
              ))}
              <li className="pl-4 text-xs text-zinc-400">+ 5 more problems</li>
            </ul>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
            >
              Browse all problems →
            </Link>
          </div>

          {/* Right: language grid */}
          <div className="flex flex-col justify-center gap-3 border-t border-indigo-200/60 p-6 dark:border-indigo-900/40 md:border-l md:border-t-0 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Pick your language
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              {LANGS.map((l) => (
                <Link
                  key={l.slug}
                  href={`/practice/${l.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-indigo-200/60 bg-white/70 px-3 py-3 text-center transition-all hover:border-indigo-400 hover:bg-white hover:shadow-sm dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50"
                >
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
