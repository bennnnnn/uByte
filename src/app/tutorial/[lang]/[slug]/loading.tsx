export default function TutorialStepLoading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      {/* Instructions panel skeleton */}
      <div className="hidden w-[380px] shrink-0 border-r border-zinc-200 p-6 dark:border-zinc-800 md:block">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
          ))}
        </div>
      </div>
      {/* Code editor skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-10 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex-1 bg-zinc-900 p-4">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-zinc-800" style={{ width: `${40 + Math.random() * 50}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
