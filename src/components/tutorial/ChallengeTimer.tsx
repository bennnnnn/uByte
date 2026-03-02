"use client";

interface Props {
  display: string;
}

export default function ChallengeTimer({ display }: Props) {
  return (
    <div className="fixed left-1/2 top-14 z-[51] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 shadow-md dark:border-amber-700 dark:bg-amber-950/70">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">🏁 Challenge</span>
        <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-300">{display}</span>
      </div>
    </div>
  );
}
