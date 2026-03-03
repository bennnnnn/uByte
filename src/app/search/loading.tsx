export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-6 py-8">
      <div className="mb-6 h-12 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-2 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
