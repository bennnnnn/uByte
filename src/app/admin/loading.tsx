export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-8">
      <div className="mb-6 h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-zinc-100 p-4 last:border-0 dark:border-zinc-800">
            <div className="flex gap-4">
              <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-900" />
              <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
