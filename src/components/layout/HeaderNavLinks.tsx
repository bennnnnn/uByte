"use client";

import Link from "next/link";

const LANGUAGES = [
  { slug: "go",         icon: "🐹", label: "Go",         sub: "Beginner-friendly"    },
  { slug: "python",     icon: "🐍", label: "Python",     sub: "Clean & readable"      },
  { slug: "javascript", icon: "🟨", label: "JavaScript", sub: "Web & Node.js"         },
  { slug: "java",       icon: "☕", label: "Java",       sub: "Enterprise & OOP"      },
  { slug: "rust",       icon: "🦀", label: "Rust",       sub: "Systems programming"   },
  { slug: "cpp",        icon: "⚙️", label: "C++",        sub: "Performance & control" },
];

const PRACTICE_LANGS = [
  { slug: "go",         icon: "🐹", label: "Go"         },
  { slug: "python",     icon: "🐍", label: "Python"     },
  { slug: "javascript", icon: "🟨", label: "JavaScript" },
  { slug: "java",       icon: "☕", label: "Java"       },
  { slug: "rust",       icon: "🦀", label: "Rust"       },
  { slug: "cpp",        icon: "⚙️", label: "C++"        },
];

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

const chevron =
  "ml-1 inline-block h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180";

/** side="left"  → Tutorials + Practice dropdowns
 *  side="right" → Leaderboard + Pricing links (default) */
export default function HeaderNavLinks({ side = "right" }: { side?: "left" | "right" }) {
  if (side === "left") {
    return (
      <nav className="flex items-center gap-1" aria-label="Main navigation">

        {/* ── Tutorials dropdown ──────────────────────────────────── */}
        <div className="group relative">
          <button type="button" className={`${linkBase} flex items-center`}>
            Tutorials
            <svg className={chevron} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-64 origin-top-left rounded-2xl border border-zinc-200 bg-white opacity-0 shadow-xl shadow-zinc-200/60 transition-all duration-150 group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
            <div className="p-2">
              {LANGUAGES.map((l) => (
                <Link
                  key={l.slug}
                  href={`/${l.slug}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base dark:bg-zinc-800">
                    {l.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{l.label}</span>
                    <span className="block text-xs text-zinc-400 dark:text-zinc-500">{l.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Interview Prep (coding problems) dropdown ────────────── */}
        <div className="group relative">
          <button type="button" className={`${linkBase} flex items-center`}>
            Interview Prep
            <svg className={chevron} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-56 origin-top-left rounded-2xl border border-zinc-200 bg-white opacity-0 shadow-xl shadow-zinc-200/60 transition-all duration-150 group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
            <div className="p-2">
              <Link
                href="/practice"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-base dark:bg-indigo-950/60">
                  🎯
                </span>
                <span>
                  <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">All problems</span>
                  <span className="block text-xs text-zinc-400 dark:text-zinc-500">Browse every language</span>
                </span>
              </Link>

              <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

              {PRACTICE_LANGS.map((l) => (
                <Link
                  key={l.slug}
                  href={`/practice/${l.slug}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="w-6 text-center text-base">{l.icon}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Certifications dropdown ──────────────────────────────── */}
        <div className="group relative">
          <button type="button" className={`${linkBase} flex items-center`}>
            Certifications
            <svg className={chevron} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-56 origin-top-left rounded-2xl border border-zinc-200 bg-white opacity-0 shadow-xl shadow-zinc-200/60 transition-all duration-150 group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
            <div className="p-2">
              <Link
                href="/certifications"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-base dark:bg-amber-950/60">
                  📝
                </span>
                <span>
                  <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">Certifications</span>
                  <span className="block text-xs text-zinc-400 dark:text-zinc-500">MCQ by language</span>
                </span>
              </Link>

              <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

              {PRACTICE_LANGS.map((l) => (
                <Link
                  key={l.slug}
                  href={`/certifications/${l.slug}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="w-6 text-center text-base">{l.icon}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Secondary navigation">
      {/* ── Leaderboard ─────────────────────────────────────────── */}
      <Link href="/leaderboard" className={linkBase}>
        Leaderboard
      </Link>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <Link href="/pricing" className={linkBase}>
        Pricing
      </Link>
    </nav>
  );
}
