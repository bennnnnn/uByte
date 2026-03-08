export default function TutorialListLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-4 h-4 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
