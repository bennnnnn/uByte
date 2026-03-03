export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
      <div className="mb-8 h-10 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border-2 border-zinc-200 p-8 dark:border-zinc-800">
            <div className="mb-4 h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mb-2 h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
            <div className="mt-6 h-12 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
