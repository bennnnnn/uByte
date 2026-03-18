import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllTutorials } from "@/lib/tutorials";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { getAllPracticeProblems, getPracticeProblemBySlug } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { getExamConfigForAllLangs, getLastActivity, getUserPlan, getExamPublicStatsByLang, getUserExamStats } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getPopularLanguages, getPopularPracticeProblems, getFallbackPopularLanguages, getFallbackPopularPracticeProblems } from "@/lib/db/home-popular";
import { tutorialLangUrl, tutorialUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS, buildSiteSearchJsonLd } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import type { SupportedLanguage } from "@/lib/languages/types";
import dynamic from "next/dynamic";
import {
  LangCard,
  SectionHeading,
  HeroSection,
  PracticeExamsSection,
} from "@/components/home";
import ContinueBanner from "@/components/ContinueBanner";
import LeftOffBanner from "@/components/LeftOffBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";
import ReferralPromptBanner from "@/components/ReferralPromptBanner";

// Below-fold sections: lazy-loaded to reduce initial bundle
const StepsSection              = dynamic(() => import("@/components/home/StepsSection"));
const ValuePropBanner           = dynamic(() => import("@/components/home/ValuePropBanner"));
const PopularTutorialsSection   = dynamic(() => import("@/components/home/PopularTutorialsSection"));
const PopularInterviewPrepSection = dynamic(() => import("@/components/home/PopularInterviewPrepSection"));
// Testimonials are below the fold and not SEO-critical; skip SSR to keep initial HTML small
const TestimonialsStrip         = dynamic(() => import("@/components/home/TestimonialsStrip"), { ssr: false, loading: () => null });

export const metadata: Metadata = {
  title: "uByte — Learn to Code with Interactive Tutorials, Interview Prep & Certifications",
  description:
    "The best alternative to W3Schools, Codecademy, and LeetCode — combined. Free interactive coding tutorials, 200+ interview prep problems, and certification exams in Go, Python, JavaScript, Java, C++, Rust, and C#. Write and run real code in your browser.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding bootcamp alternative",
    "software engineer interview prep",
    "programming certification online",
    "learn to code and get certified",
    "best coding platform",
    "coding website like w3schools",
    "better than codecademy",
    "coding tutorial website",
    "learn programming online",
    "free coding website",
    "coding practice website",
    "interactive programming course",
  ],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "uByte — Interactive Coding Tutorials, Interview Prep & Certifications",
    description:
      "Free interactive tutorials, 200+ coding problems, and certification exams in Go, Python, JavaScript, Java, C++, Rust, and C#. The best alternative to W3Schools and Codecademy.",
    type: "website",
    url: absoluteUrl("/"),
  },
};

export default async function Home() {
  const goTutorials = getAllTutorials("go");
  const topicCount = goTutorials.length;
  const problemCount = getAllPracticeProblems().length;
  // Kick off all independent async work in parallel
  const [examConfigByLang, user, popularLanguages, popularProblems, publicExamStats] = await Promise.all([
    getExamConfigForAllLangs(),
    getCurrentUser(),
    getPopularLanguages(),
    getPopularPracticeProblems(),
    getExamPublicStatsByLang(),
  ]);

  // Resolve "You left off at..." + user plan + user exam stats — need user but independent of each other
  let leftOff: { href: string; label: string } | null = null;
  let continueLang: SupportedLanguage = "go";
  let userPlan = "free";
  let userExamStats: { lang: string; attemptCount: number; lastPassed: boolean | null; lastScore: number | null; bestScore: number | null; hasCertificate: boolean }[] = [];

  if (user) {
    const [last, fetchedPlan, examStats] = await Promise.all([
      getLastActivity(user.userId),
      getUserPlan(user.userId),
      getUserExamStats(user.userId),
    ]);
    userExamStats = examStats;
    userPlan = fetchedPlan;
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

  // Total lessons summed across ALL languages — updates automatically when new tutorials are added
  const totalLessonCount = ALL_LANGUAGE_KEYS.reduce(
    (sum, lang) => sum + getTotalLessonCount(lang),
    0
  );

  // Number of languages with a published exam config (dynamic — add a new lang and it counts itself)
  const certificationCount = Object.values(examConfigByLang).filter(Boolean).length;

  const isPro = hasPaidAccess(userPlan);
  const publicStatsByLang = Object.fromEntries(publicExamStats.map((s) => [s.lang, s]));
  const examStatsByLang = Object.fromEntries(userExamStats.map((s) => [s.lang, s]));
  const popularPracticeProblems =
    popularProblems.length > 0 ? popularProblems : getFallbackPopularPracticeProblems();
  const popularLangs =
    popularLanguages.length > 0 ? popularLanguages : getFallbackPopularLanguages();

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
      <HeroSection
        topicCount={topicCount}
        totalLessonCount={totalLessonCount}
        problemCount={problemCount}
        languageCount={ALL_LANGUAGE_KEYS.length}
        certificationCount={certificationCount}
      />

      {/* ── Referral prompt banner — client-rendered, dismissable ─────── */}
      <ReferralPromptBanner />

      {/* ── 2-N. Sections — constrained ─────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

        {/* You left off at... (from DB, logged-in only) */}
        {leftOff && <LeftOffBanner href={leftOff.href} label={leftOff.label} />}

        {/* Continue banner (logged-in users only) */}
        <ContinueBanner lang={continueLang} tutorials={continueTutorialList} />

        {/* How it works */}
        <StepsSection />

        {/* Why upgrade — value proposition banner (hidden for Pro users) */}
        <ValuePropBanner isPro={isPro} />

        {/* Social proof — developer testimonials */}
        <TestimonialsStrip />

        {/* Languages */}
        <section aria-labelledby="languages-heading">
          <SectionHeading
            id="languages-heading"
            eyebrow="Languages"
            title="The languages that get you hired."
            subtitle="Pick one and build real skills — guided tutorials, interview prep, and a verifiable certificate, every step of the way."
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

        {/* Popular languages — sorted by real learner count */}
        <PopularTutorialsSection languages={popularLangs} />

        {/* Popular interview prep — sorted by real view count */}
        <PopularInterviewPrepSection problems={popularPracticeProblems} />

        {/* Certifications */}
        <PracticeExamsSection
          examConfigByLang={examConfigByLang}
          publicStatsByLang={publicStatsByLang}
          statsByLang={examStatsByLang}
          isLoggedIn={!!user}
        />

        {/* Spacer before footer */}
        <div className="pb-8 sm:pb-12" />
      </div>
    </div>
  );
}
