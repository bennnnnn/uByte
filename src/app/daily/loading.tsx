export default function DailyLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-4 h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
      <div className="mb-8 h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
      <div className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
