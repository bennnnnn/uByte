export default function PracticeLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid flex-1 gap-4 p-4 md:grid-cols-3">
        <div className="animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900 md:col-span-1" style={{ minHeight: 200 }} />
        <div className="animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900 md:col-span-2" style={{ minHeight: 400 }} />
      </div>
    </div>
  );
}
