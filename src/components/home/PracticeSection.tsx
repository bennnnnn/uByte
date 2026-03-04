import Link from "next/link";

const PROBLEMS = [
  { label: "Two Sum",            diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Three Sum",          diff: "medium", color: "text-amber-600 dark:text-amber-400"   },
  { label: "Maximum Subarray",   diff: "medium", color: "text-amber-600 dark:text-amber-400"   },
  { label: "Trapping Rain Water",diff: "hard",   color: "text-red-600 dark:text-red-400"       },
  { label: "Valid Parentheses",  diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Climbing Stairs",    diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
];

const CARD_STYLE =
  "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 hover:border-indigo-400 hover:shadow-indigo-100 dark:border-indigo-900/40 dark:from-zinc-900 dark:to-indigo-950/20 dark:hover:border-indigo-700";
const BADGE_STYLE = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400";
const ARROW_STYLE = "text-indigo-600 dark:text-indigo-400";

const LANGS = [
  { slug: "go",         icon: "🐹", label: "Go",         desc: "Arrays, hashmaps & goroutines", card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
  { slug: "python",     icon: "🐍", label: "Python",     desc: "Clean syntax, fast prototyping", card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
  { slug: "javascript", icon: "🟨", label: "JavaScript", desc: "Closures, callbacks & async",   card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
  { slug: "java",       icon: "☕", label: "Java",       desc: "OOP, generics & collections",   card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
  { slug: "rust",       icon: "🦀", label: "Rust",       desc: "Ownership, lifetimes & safety", card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
  { slug: "cpp",        icon: "⚙️", label: "C++",        desc: "Pointers, STL & performance",   card: CARD_STYLE, badge: BADGE_STYLE, arrow: ARROW_STYLE },
];

export default function PracticeSection() {
  return (
    <section aria-labelledby="practice-heading" className="space-y-5">
      {/* ── Main practice CTA card ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/40 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-violet-950/20">
        <div className="p-6 sm:p-8">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 id="practice-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Ace your interview
            </h2>
            <span className="rounded-full border border-indigo-300 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-700 dark:bg-zinc-900/80 dark:text-indigo-400">
              LeetCode-style
            </span>
          </div>
          <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            Solve classic problems — Two Sum, LRU Cache, Merge Intervals and more — in any language. Same IDE, built right in.
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
          >
            <span>Browse all problems</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
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
