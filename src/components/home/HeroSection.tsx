import { GradientText } from "@/components/ui";
import HeroCTAButtons from "./HeroCTAButtons";
import HeroIDE from "./HeroIDE";

const FEATURES = [
  "Write real code in your browser — zero setup, zero installs",
  "Tutorials → Interview prep → Verifiable certification, all in one",
  "Instant feedback on every step — know if you're right immediately",
  "Earn a certificate you can share on LinkedIn and your résumé",
];

interface HeroSectionProps {
  topicCount?: number;
  totalLessonCount?: number;
  problemCount?: number;
  languageCount?: number;
  certificationCount?: number;
}

export default function HeroSection({
  topicCount = 19,
  totalLessonCount = 0,
  problemCount = 11,
  languageCount = 6,
  certificationCount = 6,
}: HeroSectionProps) {
  const problemsLabel = problemCount >= 10 ? `${problemCount}+` : String(problemCount);
  const lessonsLabel = totalLessonCount > 0 ? `${totalLessonCount}+` : String(topicCount);

  return (
    <section className="relative overflow-hidden">
      {/* Glow orbs — translateZ(0) isolates on GPU layer, preventing CLS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden [transform:translateZ(0)]">
        <div className="absolute -left-40 top-1/4 h-[700px] w-[700px] -translate-y-1/4 rounded-full bg-indigo-200/40 blur-[80px] dark:bg-indigo-500/15" />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-violet-200/30 blur-[70px] dark:bg-violet-500/10" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-200/20 blur-[60px] dark:bg-cyan-500/10" />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid-28-light opacity-[0.4] dark:opacity-[0.25]" />
      <div className="pointer-events-none absolute inset-0 hidden bg-dot-grid-28-dark opacity-[0.2] dark:block" />

      {/* Content — svh is stable (doesn't resize as mobile chrome appears/hides), avoiding CLS */}
      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:min-h-[calc(100svh-3.5rem)] sm:px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-8 py-10 sm:gap-10 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">

          {/* LEFT: server-rendered copy — LCP elements land in initial HTML */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Free to start · No credit card · Zero setup
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-[2rem] font-black leading-[1.08] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[2.75rem] sm:leading-[1.04] lg:text-[3.25rem] xl:text-[3.75rem]">
              Learn. Practice.
              <GradientText className="mt-1 block">
                Get certified.
              </GradientText>
            </h1>

            {/* Subtitle — this is the LCP element; server-rendered for instant paint */}
            <p className="mb-8 max-w-[480px] text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
              The complete path from beginner to job-ready — interactive tutorials,
              LeetCode-style interview prep, and verifiable certificates. All in one place, no installs needed.
            </p>

            {/* Feature list */}
            <ul className="mb-10 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Auth-aware CTAs — client component */}
            <HeroCTAButtons />

            {/* Stats */}
            <div className="flex flex-wrap gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              {[
                { n: String(languageCount),      label: "Languages",     color: "text-indigo-600 dark:text-indigo-400"  },
                { n: lessonsLabel,               label: "Total Lessons",  color: "text-violet-600 dark:text-violet-400"  },
                { n: problemsLabel,              label: "Interview Qs",   color: "text-cyan-600 dark:text-cyan-400"      },
                { n: String(certificationCount), label: "Certifications", color: "text-amber-600 dark:text-amber-400"    },
              ].map(({ n, label, color }) => (
                <div key={label}>
                  <p className={`text-2xl font-black ${color}`}>{n}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: interactive IDE — client component */}
          <HeroIDE />
        </div>

        {/* Scroll hint */}
        <a
          href="#how-heading"
          className="flex items-center justify-center gap-2 pb-6 text-zinc-400 transition-colors hover:text-indigo-500 dark:text-zinc-500 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7 7" />
          </svg>
          <span className="text-[11px] font-medium tracking-wide">See how it works</span>
        </a>
      </div>
    </section>
  );
}
