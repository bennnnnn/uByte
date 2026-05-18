import type { ReactNode } from "react";

/** Floating success + streak badges shared by mobile preview and desktop HeroIDE. */
export function HeroIDEFloatingBadges({
  wrapperClassName = "relative pb-6 sm:pb-8",
  successClassName = "absolute right-2 top-0 z-10 flex -translate-y-1/2 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md dark:border-emerald-800/60 dark:bg-zinc-900 dark:text-emerald-400 sm:-right-3 sm:-top-5 sm:translate-y-0",
  streakClassName = "absolute bottom-0 left-2 z-10 flex translate-y-1/2 items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-md dark:border-amber-800/60 dark:bg-zinc-900 dark:text-amber-400 sm:-bottom-4 sm:-left-3 sm:translate-y-0",
  children,
}: {
  wrapperClassName?: string;
  successClassName?: string;
  streakClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={wrapperClassName}>
      <div className={successClassName}>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] dark:bg-emerald-900/50 sm:h-5 sm:w-5 sm:text-[11px]">
          ✓
        </span>
        Step passed! ✓
      </div>
      <div className={streakClassName}>
        <span className="text-sm sm:text-base">🔥</span>
        3-day streak
      </div>
      {children}
    </div>
  );
}

export function HeroIDEWindowChrome({
  filename,
  headerExtra,
  compact = false,
}: {
  filename: string;
  headerExtra?: ReactNode;
  compact?: boolean;
}) {
  const dotSize = compact ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <div
      className={`flex items-center gap-3 border-b border-zinc-100 bg-surface-card dark:border-zinc-700/80 ${
        compact ? "px-4 py-2.5" : "px-4 py-3 dark:border-zinc-700"
      }`}
    >
      <div className="flex gap-1.5">
        <span className={`${dotSize} rounded-full bg-red-400/80`} />
        <span className={`${dotSize} rounded-full bg-yellow-400/80`} />
        <span className={`${dotSize} rounded-full bg-emerald-400/80`} />
      </div>
      {headerExtra}
      <span
        className={`shrink-0 font-mono text-zinc-400 dark:text-zinc-500 ${
          compact ? "text-[11px] font-semibold" : "rounded bg-zinc-100 px-2 py-0.5 text-[10px] dark:bg-zinc-700"
        }`}
      >
        {filename}
      </span>
    </div>
  );
}

export function HeroIDEStepBanner({
  instruction,
  compact = false,
}: {
  instruction: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`border-b border-zinc-100 bg-indigo-50/70 dark:border-zinc-700/80 dark:bg-indigo-950/40 ${
        compact ? "px-4 py-2.5" : "bg-indigo-50/60 px-4 py-3 dark:border-zinc-700"
      }`}
    >
      <div className={`flex items-center gap-2 ${compact ? "mb-1" : "mb-1.5"}`}>
        <span
          className={`rounded-full bg-indigo-100 font-bold uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400 ${
            compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[9px]"
          }`}
        >
          Step 1 / 5
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Getting Started</span>
      </div>
      <p className={`text-zinc-500 dark:text-zinc-400 ${compact ? "text-[11px]" : "text-[11px] leading-relaxed"}`}>
        {instruction}
      </p>
    </div>
  );
}

export function HeroIDEOutputPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`border-t border-zinc-100 dark:border-zinc-700/80 ${
        compact ? "bg-zinc-50/60 px-4 py-3 dark:bg-zinc-800/40" : "bg-surface-card px-4 py-3 dark:border-zinc-700"
      }`}
    >
      <p
        className={`font-bold uppercase tracking-[0.15em] text-zinc-400 ${
          compact ? "mb-1 text-[9px]" : "mb-1.5 text-[9px] dark:text-zinc-500"
        }`}
      >
        Output
      </p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Hello, World!</span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] dark:bg-emerald-900/50">
            ✓
          </span>
          Correct!
        </span>
      </div>
    </div>
  );
}
