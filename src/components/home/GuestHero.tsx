import Link from "next/link";
import HeroIDEDeferred from "./HeroIDEDeferred";
import MobileCodePreview from "./MobileCodePreview";

export default function GuestHero({ totalLessons }: { totalLessons: number }) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
      <div
        className="absolute inset-0 bg-white dark:bg-zinc-950"
        style={{
          backgroundImage:
            "radial-gradient(circle at 60% 0%, rgba(99,102,241,0.06) 0%, transparent 60%), " +
            "radial-gradient(circle at 10% 90%, rgba(139,92,246,0.05) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-800/60">
              ✓ Free interactive tutorials in 9 languages
            </p>

            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15] dark:text-white">
              Learn to code.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                Stay in the editor.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500 lg:mx-0 dark:text-zinc-400">
              Step-by-step tutorials with{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                live code, instant feedback, and saved progress
              </span>{" "}
              — all running live in your browser. Every lesson is free, and you only pay if you want detailed hints.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/tutorial/python"
                className="rounded-xl bg-indigo-600 px-7 py-3 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Start with Python →
              </Link>
              <Link
                href="/tutorial/go"
                className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-base font-bold text-zinc-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                Start with Go →
              </Link>
              <Link
                href="/tutorial"
                className="text-sm font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Browse all tutorials
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-4 gap-x-3 gap-y-4 border-t border-zinc-100 pt-8 dark:border-zinc-800">
              {[
                { value: "9", label: "Languages", mobileLabel: "Languages" },
                { value: `${totalLessons}+`, label: "Free lessons", mobileLabel: "Lessons" },
                { value: "Live", label: "Code execution", mobileLabel: "Runs live" },
                { value: "0", label: "Setup required", mobileLabel: "No setup" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-xl font-black text-zinc-900 sm:text-2xl dark:text-zinc-100">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-sm dark:text-zinc-400">
                    <span className="sm:hidden">{stat.mobileLabel}</span>
                    <span className="hidden sm:inline">{stat.label}</span>
                  </p>
                </div>
              ))}
            </div>

            <MobileCodePreview />
          </div>

          <div className="hidden w-full max-w-md shrink-0 lg:block">
            <HeroIDEDeferred />
          </div>
        </div>
      </div>

      <div className="relative border-t border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
            {[
              { icon: "💻", title: "Runs in your browser", desc: "No installs, no setup. Start writing real code in seconds." },
              { icon: "🧭", title: "Start with a real track", desc: "Choose a language, follow a clear path, and always know what comes next." },
              { icon: "💡", title: "Hints only when needed", desc: "Every lesson is free. Pay only if you want extra help at the exact step you're stuck on." },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
