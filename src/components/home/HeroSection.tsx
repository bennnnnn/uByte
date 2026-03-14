import dynamic from "next/dynamic";
import { GradientText } from "@/components/ui";
import HeroCTAButtons from "./HeroCTAButtons";

// HeroIDE is only shown on lg+ screens (hidden on mobile). Lazy-load it so its
// JS is excluded from the critical bundle — saves ~15 KiB on mobile.
const HeroIDE = dynamic(() => import("./HeroIDE"), { ssr: false, loading: () => null });

const FEATURES = [
  "Write real code in your browser — zero setup, zero installs",
  "Tutorials → Interview prep → Certification, all in one",
  "Instant feedback on every step — know if you're right immediately",
  "Earn a certificate that proves your understanding",
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

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:min-h-[calc(100svh-3.5rem)] lg:px-8">
        <div className="grid flex-1 items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">

          {/* LEFT: copy */}
          <div>
            {/* Headline */}
            <h1 className="mb-4 text-[2.25rem] font-black leading-[1.08] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[2.75rem] sm:leading-[1.04] lg:text-[3.25rem] xl:text-[3.75rem]">
              Learn. Practice.
              <GradientText className="mt-1 block">
                Get certified.
              </GradientText>
            </h1>

            {/* Subtitle */}
            <p className="mb-7 max-w-[480px] text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
              The complete path from beginner to job-ready — interactive tutorials,
              coding interview prep, and certification exams. All in one place, no installs needed.
            </p>

            {/* Feature list — hidden on mobile to keep hero compact */}
            <ul className="mb-8 hidden space-y-3 md:block">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Auth-aware CTAs */}
            <HeroCTAButtons />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex sm:flex-wrap sm:gap-6 sm:pt-8">
              {[
                { n: String(languageCount),      label: "Languages",     color: "text-indigo-600 dark:text-indigo-400"  },
                { n: lessonsLabel,               label: "Lessons",        color: "text-violet-600 dark:text-violet-400"  },
                { n: problemsLabel,              label: "Interview Qs",   color: "text-cyan-600 dark:text-cyan-400"      },
                { n: String(certificationCount), label: "Certs",          color: "text-amber-600 dark:text-amber-400"    },
              ].map(({ n, label, color }) => (
                <div key={label}>
                  <p className={`text-xl font-black sm:text-2xl ${color}`}>{n}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: interactive IDE — hidden on mobile, shown from lg up */}
          <div className="hidden lg:block">
            <HeroIDE />
          </div>
        </div>

        {/* Scroll hint — hidden on mobile */}
        <a
          href="#how-heading"
          className="hidden items-center justify-center gap-2 pb-6 text-zinc-400 transition-colors hover:text-indigo-500 dark:text-zinc-500 dark:hover:text-indigo-400 lg:flex"
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
