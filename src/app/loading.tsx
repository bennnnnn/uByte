export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero skeleton */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="mb-4 h-10 w-80 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-2 h-4 w-96 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-4 w-72 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-6 h-10 w-40 animate-pulse rounded-lg bg-indigo-200 dark:bg-indigo-900/40" />
      </div>
      {/* Language cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
