import Link from "next/link";

const PROBLEMS = [
  { label: "Two Sum",            diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Three Sum",          diff: "medium", color: "text-amber-600 dark:text-amber-400"   },
  { label: "Maximum Subarray",   diff: "medium", color: "text-amber-600 dark:text-amber-400"   },
  { label: "Trapping Rain Water",diff: "hard",   color: "text-red-600 dark:text-red-400"       },
  { label: "Valid Parentheses",  diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Climbing Stairs",    diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
];

const LANGS = [
  {
    slug: "go",
    icon: "🐹",
    label: "Go",
    desc: "Arrays, hashmaps & goroutines",
    card: "border-cyan-200 bg-gradient-to-br from-white to-cyan-50/60 hover:border-cyan-400 hover:shadow-cyan-100 dark:border-cyan-900/40 dark:from-zinc-900 dark:to-cyan-950/20 dark:hover:border-cyan-700",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
    arrow: "text-cyan-600 dark:text-cyan-400",
  },
  {
    slug: "python",
    icon: "🐍",
    label: "Python",
    desc: "Clean syntax, fast prototyping",
    card: "border-blue-200 bg-gradient-to-br from-white to-blue-50/60 hover:border-blue-400 hover:shadow-blue-100 dark:border-blue-900/40 dark:from-zinc-900 dark:to-blue-950/20 dark:hover:border-blue-700",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    arrow: "text-blue-600 dark:text-blue-400",
  },
  {
    slug: "javascript",
    icon: "🟨",
    label: "JavaScript",
    desc: "Closures, callbacks & async",
    card: "border-yellow-200 bg-gradient-to-br from-white to-yellow-50/60 hover:border-yellow-400 hover:shadow-yellow-100 dark:border-yellow-900/40 dark:from-zinc-900 dark:to-yellow-950/20 dark:hover:border-yellow-700",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    arrow: "text-yellow-600 dark:text-yellow-500",
  },
  {
    slug: "java",
    icon: "☕",
    label: "Java",
    desc: "OOP, generics & collections",
    card: "border-orange-200 bg-gradient-to-br from-white to-orange-50/60 hover:border-orange-400 hover:shadow-orange-100 dark:border-orange-900/40 dark:from-zinc-900 dark:to-orange-950/20 dark:hover:border-orange-700",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    arrow: "text-orange-600 dark:text-orange-400",
  },
  {
    slug: "rust",
    icon: "🦀",
    label: "Rust",
    desc: "Ownership, lifetimes & safety",
    card: "border-red-200 bg-gradient-to-br from-white to-red-50/60 hover:border-red-400 hover:shadow-red-100 dark:border-red-900/40 dark:from-zinc-900 dark:to-red-950/20 dark:hover:border-red-700",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    arrow: "text-red-600 dark:text-red-400",
  },
  {
    slug: "cpp",
    icon: "⚙️",
    label: "C++",
    desc: "Pointers, STL & performance",
    card: "border-violet-200 bg-gradient-to-br from-white to-violet-50/60 hover:border-violet-400 hover:shadow-violet-100 dark:border-violet-900/40 dark:from-zinc-900 dark:to-violet-950/20 dark:hover:border-violet-700",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    arrow: "text-violet-600 dark:text-violet-400",
  },
];

export default function PracticeSection() {
  return (
    <section aria-labelledby="practice-heading" className="space-y-5">
      {/* ── Main practice CTA card ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/40 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-violet-950/20">
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
      </div>

      {/* ── Per-language practice cards ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANGS.map((l) => (
          <Link
            key={l.slug}
            href={`/practice/${l.slug}`}
            className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${l.card}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-zinc-900">
                  {l.icon}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {l.label}
                </h3>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${l.badge}`}>
                11 problems
              </span>
            </div>

            <p className="flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {l.desc}
            </p>

            <div className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-[gap] group-hover:gap-2 ${l.arrow}`}>
              <span>Start practicing</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
