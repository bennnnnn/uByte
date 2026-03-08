import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllTutorials } from "@/lib/tutorials";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { getAllPracticeProblems, getPracticeProblemBySlug } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { getExamConfigForAllLangs, getLastActivity } from "@/lib/db";
import { tutorialLangUrl, tutorialUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS, buildSiteSearchJsonLd } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import type { SupportedLanguage } from "@/lib/languages/types";
import {
  LangCard,
  SectionHeading,
  HeroSection,
  PracticeSection,
  PracticeExamsSection,
  StepsSection,
} from "@/components/home";
import ContinueBanner from "@/components/ContinueBanner";
import LeftOffBanner from "@/components/LeftOffBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";

export const metadata: Metadata = {
  title: "uByte - Programming Tutorials, Interview Prep, and Certifications",
  description:
    "Learn programming with interactive tutorials in Go, Python, C++, JavaScript, Java, and Rust. Practice interview questions and certification-style exams.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding bootcamp alternative",
    "software engineer interview prep",
    "programming lessons online",
  ],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "uByte - Programming Tutorials, Interview Prep, and Certifications",
    description:
      "Interactive programming tutorials, interview prep, and certification-style exams.",
    type: "website",
    url: absoluteUrl("/"),
  },
};

export default async function Home() {
  const goTutorials = getAllTutorials("go");
  const topicCount = goTutorials.length;
  const problemCount = getAllPracticeProblems().length;
  const examConfigByLang = await getExamConfigForAllLangs();

  const websiteJsonLd = buildSiteSearchJsonLd();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: BASE_URL,
    sameAs: [BASE_URL],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Programming language tutorial tracks on uByte",
    itemListElement: getAllLanguageSlugs().map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: LANGUAGES[slug as SupportedLanguage]?.name ?? slug,
      url: absoluteUrl(tutorialLangUrl(slug)),
    })),
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteJsonLd, orgJsonLd, itemListJsonLd]),
        }}
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
          <SectionHeading
            id="languages-heading"
            title="Programming Language Tutorials"
            subtitle="Learn Go, Python, C++, JavaScript, Java, and Rust with the same step-by-step tutorial structure."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languageEntries.map(({ slug, config }) => (
              <LangCard
                key={slug}
                href={tutorialLangUrl(slug)}
                icon={getLangIcon(slug)}
                name={config.name}
                badge={`${getTotalLessonCount(slug as SupportedLanguage)} lessons`}
                description={config.seo.defaultDescription}
                cta="View tutorials"
              />
            ))}
          </div>
        </section>

        {/* Interview practice */}
        <PracticeSection problemCount={problemCount} />

        {/* Certifications */}
        <PracticeExamsSection examConfigByLang={examConfigByLang} />
      </div>
    </div>
  );
}
