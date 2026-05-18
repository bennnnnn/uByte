import {
  HeroIDEFloatingBadges,
  HeroIDEOutputPanel,
  HeroIDEStepBanner,
  HeroIDEWindowChrome,
} from "./HeroIDEShell";

/** Static IDE preview shown below guest hero copy on mobile. */
export default function MobileCodePreview() {
  return (
    <HeroIDEFloatingBadges
      wrapperClassName="relative mx-4 mt-10 max-w-sm sm:mx-auto lg:hidden"
      successClassName="absolute -right-2 -top-3 z-10 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md dark:border-emerald-800/60 dark:bg-zinc-900 dark:text-emerald-400"
      streakClassName="absolute -bottom-3 -left-2 z-10 flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-md dark:border-amber-800/60 dark:bg-zinc-900 dark:text-amber-400"
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-900/60">
        <HeroIDEWindowChrome filename="hello.go" compact />
        <HeroIDEStepBanner
          compact
          instruction={
            <>
              Use <code className="font-mono text-indigo-600 dark:text-indigo-400">fmt.Println()</code> to print
              &quot;Hello, World!&quot; to the console.
            </>
          }
        />
        <div className="bg-white px-4 py-3 font-mono text-[12px] leading-[1.8] dark:bg-zinc-900">
          <p><span className="text-violet-600 dark:text-violet-400">package</span><span className="text-zinc-700 dark:text-zinc-300"> main</span></p>
          <p className="mt-0.5"><span className="text-violet-600 dark:text-violet-400">import </span><span className="text-emerald-600 dark:text-emerald-400">&quot;fmt&quot;</span></p>
          <p className="mt-0.5"><span className="text-violet-600 dark:text-violet-400">func </span><span className="text-blue-600 dark:text-blue-400">main</span><span className="text-zinc-700 dark:text-zinc-300">() {"{"}</span></p>
          <p className="ml-4"><span className="text-cyan-600 dark:text-cyan-400">fmt</span><span className="text-zinc-600 dark:text-zinc-400">.</span><span className="text-blue-600 dark:text-blue-400">Println</span><span className="text-emerald-600 dark:text-emerald-400">(&quot;Hello, World!&quot;)</span></p>
          <p><span className="text-zinc-700 dark:text-zinc-300">{"}"}</span></p>
        </div>
        <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-2 dark:border-zinc-700/80">
          <span className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow shadow-indigo-600/20">
            Run
          </span>
        </div>
        <HeroIDEOutputPanel compact />
      </div>
    </HeroIDEFloatingBadges>
  );
}
