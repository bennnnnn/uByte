export default function AttemptLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
      <div className="text-center">
        <div className="mb-3 h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 mx-auto" />
        <p className="text-sm text-zinc-500">Loading exam…</p>
      </div>
    </div>
  );
}
