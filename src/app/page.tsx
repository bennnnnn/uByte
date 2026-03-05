import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllTutorials } from "@/lib/tutorials";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { getAllPracticeProblems, getPracticeProblemBySlug } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import { BASE_URL } from "@/lib/constants";
import { getExamConfig, getLastActivity } from "@/lib/db";
import { tutorialLangUrl, tutorialUrl } from "@/lib/urls";
import { getCurrentUser } from "@/lib/auth";
import type { SupportedLanguage } from "@/lib/languages/types";
import {
  LanguageCard,
  HeroSection,
  PracticeSection,
  PracticeExamsSection,
  StepsSection,
} from "@/components/home";
import ContinueBanner from "@/components/ContinueBanner";
import LeftOffBanner from "@/components/LeftOffBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";

export const metadata: Metadata = {
  title: "uByte — Learn to Code with Interactive Tutorials",
  description:
    "Learn to code with uByte. Interactive lessons in Go, Python, C++, JavaScript, Java, and Rust. Prepare for interviews with practice problems. Write and run real code in your browser.",
  keywords: [
    "learn programming",
    "interactive coding tutorials",
    "Learn Go",
    "Learn Python",
    "Learn C++",
    "interview practice",
    "coding practice",
    "uByte",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "uByte — Learn to Code with Interactive Tutorials",
    description:
      "Interactive lessons in Go, Python, C++, JavaScript, Java, and Rust. Prepare for interviews. Write and run real code in your browser.",
    type: "website",
  },
};

export default async function Home() {
  const goTutorials = getAllTutorials("go");
  const topicCount = goTutorials.length;
  const problemCount = getAllPracticeProblems().length;
  const examConfig = await getExamConfig();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "uByte",
    description: "Learn to code with interactive tutorials and interview practice.",
    url: BASE_URL,
    publisher: { "@type": "Organization", name: "uByte", url: BASE_URL },
  };

  const languageEntries = getAllLanguageSlugs()
    .map((slug) => ({ slug, config: LANGUAGES[slug as keyof typeof LANGUAGES] }))
    .filter((e): e is { slug: string; config: (typeof LANGUAGES)["go"] } => !!e.config);

  // Resolve "You left off at..." and "Continue" language from last activity (logged-in only)
  let leftOff: { href: string; label: string } | null = null;
  let continueLang: SupportedLanguage = "go";
  const user = await getCurrentUser();
  if (user) {
    const last = await getLastActivity(user.userId);
    if (last) {
      if (last.activity_type === "tutorial" && last.slug) {
        continueLang = last.lang as SupportedLanguage;
        const tutorials = getAllTutorials(continueLang);
        const meta = tutorials.find((t) => t.slug === last.slug);
        if (meta) {
          const step = last.step != null ? last.step : undefined;
          leftOff = {
            href: tutorialUrl(last.lang, last.slug, step),
            label: step != null ? `${meta.title} · Step ${step + 1}` : meta.title,
          };
        }
      } else if (last.activity_type === "practice" && last.slug) {
        const problem = getPracticeProblemBySlug(last.slug);
        if (problem) {
          const langName = LANGUAGES[last.lang as SupportedLanguage]?.name ?? last.lang;
          leftOff = {
            href: `/practice/${last.lang}/${last.slug}`,
            label: `${problem.title} (${langName})`,
          };
        }
      }
    }
  }
  const continueTutorialList = getAllTutorials(continueLang).map(({ slug, title }) => ({ slug, title }));
  const lessonCountGo = getTotalLessonCount("go");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      {/* ── 1. Hero — full bleed, dark ───────────────────────────────── */}
      <HeroSection topicCount={topicCount} lessonCountGo={lessonCountGo} problemCount={problemCount} />

      {/* ── 2-N. Sections — constrained ─────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

        {/* You left off at... (from DB, logged-in only) */}
        {leftOff && <LeftOffBanner href={leftOff.href} label={leftOff.label} />}

        {/* Continue banner (logged-in users only) */}
        <ContinueBanner lang={continueLang} tutorials={continueTutorialList} />

        {/* How it works */}
        <StepsSection />

        {/* Languages */}
        <section aria-labelledby="languages-heading">
          <div className="mb-8 text-center">
            <h2
              id="languages-heading"
              className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Pick your language
            </h2>
            <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
              Same concepts, same structure — start in seconds with no setup.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languageEntries.map(({ slug, config }) => (
              <LanguageCard
                key={slug}
                slug={slug}
                name={config.name}
                description={config.seo.defaultDescription}
                icon={getLangIcon(slug)}
                lessonCount={getTotalLessonCount(slug as SupportedLanguage)}
                href={tutorialLangUrl(slug)}
              />
            ))}
          </div>
        </section>

        {/* Interview practice */}
        <PracticeSection problemCount={problemCount} />

        {/* Practice exams */}
        <PracticeExamsSection examSize={examConfig.examSize} examDurationMinutes={examConfig.examDurationMinutes} />

        {/* Quick-nav footer */}
        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zinc-100 pt-8 text-sm dark:border-zinc-800"
          aria-label="Quick links"
        >
          {languageEntries.map(({ slug, config }) => (
            <Link
              key={slug}
              href={tutorialLangUrl(slug)}
              className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 hover:underline dark:text-zinc-500 dark:hover:text-indigo-400"
            >
              {config.name} tutorials
            </Link>
          ))}
          <Link
            href="/practice"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Interview practice →
          </Link>
          <Link
            href="/practice-exams"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Practice exams →
          </Link>
        </nav>
      </div>
    </div>
  );
}
