import type { Metadata } from "next";
import { Suspense } from "react";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { getAllPracticeProblems, getPracticeProblemBySlug } from "@/lib/practice/problems";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { getExamConfigForAllLangs, getLastActivity, getExamPublicStatsByLang } from "@/lib/db";
import { getPopularLanguages, getPopularPracticeProblems, getFallbackPopularLanguages, getFallbackPopularPracticeProblems } from "@/lib/db/home-popular";
import { tutorialUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS, buildSiteSearchJsonLd } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import { getAllTutorials } from "@/lib/tutorials";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import dynamic from "next/dynamic";

// ── Homepage sections ──────────────────────────────────────────────────────
import HomeHero                  from "@/components/home/HomeHero";
import StepsSection              from "@/components/home/StepsSection";
import TrendingSection           from "@/components/home/TrendingSection";
import ValuePropBanner           from "@/components/home/ValuePropBanner";
import CertificationsHighlight   from "@/components/home/CertificationsHighlight";
import ContinueBanner            from "@/components/ContinueBanner";
import GoogleOAuthError          from "@/components/GoogleOAuthError";
import ReferralPromptBanner      from "@/components/ReferralPromptBanner";
import TestimonialsStripDeferred from "@/components/home/TestimonialsStripDeferred";

const PopularInterviewPrepSection = dynamic(() => import("@/components/home/PopularInterviewPrepSection"));

export const metadata: Metadata = {
  title: "uByte — Interactive Coding Tutorials, Interview Prep & Free Certifications",
  description:
    "Master Go, Python, TypeScript, SQL, Java, Rust, C++ and C# with interactive tutorials. Practice with 114+ interview problems. Take free certification exams. Write and run real code in your browser.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding bootcamp alternative",
    "software engineer interview prep",
    "programming certification online",
    "learn to code and get certified",
    "best coding platform",
    "coding website like w3schools",
    "better than codecademy",
    "free coding certification",
    "learn typescript online",
    "learn sql online",
  ],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "uByte — Interactive Coding Tutorials, Interview Prep & Free Certifications",
    description:
      "Interactive tutorials for Go, Python, TypeScript, SQL and more. 114+ practice problems. Free certification exams. Zero setup — code in your browser.",
    type: "website",
    url: absoluteUrl("/"),
  },
};

export default async function Home() {
  const problemCount = getAllPracticeProblems().length;

  const [examConfigByLang, user, popularLanguages, popularProblems, publicExamStats] = await Promise.all([
    getExamConfigForAllLangs(),
    getCurrentUser(),
    getPopularLanguages(),
    getPopularPracticeProblems(),
    getExamPublicStatsByLang(),
  ]);

  // ── User-specific data ─────────────────────────────────────────────────
  let leftOff: { href: string; label: string } | null = null;
  let continueLang: SupportedLanguage = "go";
  let continueTutorialList: { slug: string; title: string }[] = [];

  if (user) {
    const last = await getLastActivity(user.userId);
    if (last) {
      if (last.activity_type === "tutorial" && last.slug) {
        continueLang = last.lang as SupportedLanguage;
        const tutorials = getAllTutorials(continueLang);
        const meta = tutorials.find(t => t.slug === last.slug);
        if (meta) {
          const step = last.step != null ? last.step : undefined;
          leftOff = {
            href: tutorialUrl(last.lang, last.slug, step),
            label: step != null ? `${meta.title} · Step ${step + 1}` : meta.title,
          };
        }
        continueTutorialList = getAllTutorials(continueLang).map(({ slug, title }) => ({ slug, title }));
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

  // ── Shared computed values ─────────────────────────────────────────────
  const totalLessonCount = ALL_LANGUAGE_KEYS.reduce(
    (sum, lang) => sum + getTotalLessonCount(lang),
    0
  );
  const certCount          = Object.values(examConfigByLang).filter(Boolean).length;
  const totalAttempts      = publicExamStats.reduce((s, r) => s + r.attemptsSubmitted, 0);
  const totalCertificates  = publicExamStats.reduce((s, r) => s + r.usersPassed, 0);
  const publicStatsByLang  = Object.fromEntries(publicExamStats.map(s => [s.lang, s]));
  // Always show every language; overlay real learner counts from the DB
  // so popular ones sort to the top, but no language is ever hidden.
  const popularLangs = getFallbackPopularLanguages()
    .map(lang => popularLanguages.find(p => p.slug === lang.slug) ?? lang)
    .sort((a, b) => b.completionCount - a.completionCount);
  const popularPracticeProbs = popularProblems.length > 0 ? popularProblems : getFallbackPopularPracticeProblems();

  const websiteJsonLd = buildSiteSearchJsonLd();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: BASE_URL,
    sameAs: [BASE_URL],
  };

  // ── Shared cert section (used in both layouts) ─────────────────────────
  const certSection = (
    <CertificationsHighlight
      totalCertificates={totalCertificates}
      totalAttempts={totalAttempts}
      statsByLang={publicStatsByLang}
      examConfigByLang={examConfigByLang}
    />
  );

  const interviewSection = (
    <PopularInterviewPrepSection problems={popularPracticeProbs} />
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, orgJsonLd]) }}
      />

      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      {/* ── HERO — personalized for logged-in users, conversion for guests ── */}
      <HomeHero
        totalLessons={totalLessonCount}
        problemCount={problemCount}
        certCount={certCount}
        leftOff={leftOff}
        continueLang={continueLang}
        continueTutorials={continueTutorialList}
        isLoggedInServer={!!user}
      />

      {user ? (
        // ════════════════════════════════════════════════════════════════
        // LOGGED-IN LAYOUT — personalized feed, no marketing fluff
        // ════════════════════════════════════════════════════════════════
        <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">

          {/* Referral banner */}
          <ReferralPromptBanner />

          {/* Active track — continue where you left off */}
          {leftOff && continueTutorialList.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Your active track
                  </p>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Keep the momentum going
                  </h2>
                </div>
              </div>
              <ContinueBanner lang={continueLang} tutorials={continueTutorialList} />
            </section>
          )}

          {/* Trending — compact 3-card row */}
          <TrendingSection languages={popularLangs} compact />

          {/* Certifications */}
          {certSection}

          {/* Interview prep */}
          {interviewSection}

        </div>
      ) : (
        // ════════════════════════════════════════════════════════════════
        // GUEST LAYOUT — conversion funnel
        // ════════════════════════════════════════════════════════════════
        <>
          <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">

            {/* 1. How it works — builds immediate trust */}
            <StepsSection />

            {/* 2. Popular languages — shows breadth */}
            <TrendingSection languages={popularLangs} />

          </div>

          {/* 3. Dark value-prop break — mid-page visual anchor */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <ValuePropBanner />
            </div>
          </div>

          <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">

            {/* 4. Certifications — the differentiator */}
            {certSection}

            {/* 5. Interview prep — proves depth */}
            {interviewSection}

            {/* 6. Testimonials — social proof to close */}
            <Suspense>
              <TestimonialsStripDeferred />
            </Suspense>

          </div>
        </>
      )}
    </div>
  );
}
