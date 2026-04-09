import Link from "next/link";
import type { HomeStruggleCard } from "@/lib/retention-home";

export default function StrugglePracticeSection({ cards }: { cards: HomeStruggleCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          Smart suggestion
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Worth another look
        </h2>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
          These steps had a few misses recently — short review here often makes the next session easier.
        </p>
      </div>
      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/60 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-amber-300 hover:bg-amber-50/90 dark:border-amber-900/40 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-amber-950/40"
            >
              <span>
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-500">
                  {c.langLabel}
                </span>
                <span className="mt-0.5 block text-left">{c.line1}</span>
              </span>
              <span className="shrink-0 text-amber-700 dark:text-amber-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
