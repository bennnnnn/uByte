export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
      <div className="mb-4 h-9 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-2 h-9 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-8 h-4 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}
