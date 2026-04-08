import type { Metadata } from "next";
import { Suspense } from "react";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { getLastActivity } from "@/lib/db";
import { getPopularLanguages, getFallbackPopularLanguages } from "@/lib/db/home-popular";
import { tutorialUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS, buildSiteSearchJsonLd } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import { getAllTutorials } from "@/lib/tutorials";
import type { SupportedLanguage } from "@/lib/languages/types";
import HomeHero from "@/components/home/HomeHero";
import StepsSection from "@/components/home/StepsSection";
import TrendingSection from "@/components/home/TrendingSection";
import ValuePropBanner from "@/components/home/ValuePropBanner";
import ContinueBanner from "@/components/ContinueBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";
import ReferralPromptBanner from "@/components/ReferralPromptBanner";
import FadeInSection from "@/components/home/FadeInSection";

export const metadata: Metadata = {
  title: "uByte — Interactive Coding Tutorials",
  description:
    "Master Go, Python, TypeScript, SQL, Java, Rust, C++ and C# with interactive tutorials. Every lesson is free. Pay only when you want detailed hints.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding bootcamp alternative",
    "best coding platform",
    "coding website like w3schools",
    "better than codecademy",
    "learn typescript online",
    "learn sql online",
    "learn programming online",
  ],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "uByte — Learn to Code With Interactive Tutorials",
    description:
      "Step-by-step coding tutorials that run in your browser. 9 languages. Free lessons. Optional paid hints.",
    type: "website",
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "uByte — Interactive Coding Tutorials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte — Learn to Code With Interactive Tutorials",
    description:
      "Step-by-step coding tutorials that run in your browser. 9 languages. Free lessons. Optional paid hints.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default async function Home() {
  const [user, popularLanguages] = await Promise.all([
    getCurrentUser(),
    getPopularLanguages(),
  ]);

  let leftOff: { href: string; label: string } | null = null;
  let continueLang: SupportedLanguage = "go";
  let continueTutorialList: { slug: string; title: string }[] = [];

  if (user) {
    const last = await getLastActivity(user.userId);
    if (last?.activity_type === "tutorial" && last.slug) {
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
      continueTutorialList = tutorials.map(({ slug, title }) => ({ slug, title }));
    }
  }

  const totalLessonCount = ALL_LANGUAGE_KEYS.reduce(
    (sum, lang) => sum + getTotalLessonCount(lang),
    0
  );

  const popularLangs = getFallbackPopularLanguages()
    .map((lang) => popularLanguages.find((p) => p.slug === lang.slug) ?? lang)
    .sort((a, b) => b.learnerCount - a.learnerCount);

  const websiteJsonLd = buildSiteSearchJsonLd();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: BASE_URL,
    sameAs: [BASE_URL],
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <script
        async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, orgJsonLd]) }}
      />

      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      <HomeHero
        totalLessons={totalLessonCount}
        leftOff={leftOff}
        continueLang={continueLang}
        continueTutorials={continueTutorialList}
        isLoggedInServer={!!user}
      />

      {user ? (
        <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
          <ReferralPromptBanner />

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

          <TrendingSection languages={popularLangs} compact />
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
            <FadeInSection>
              <StepsSection />
            </FadeInSection>

            <FadeInSection delay={100}>
              <TrendingSection languages={popularLangs} />
            </FadeInSection>
          </div>

          <FadeInSection delay={50}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <ValuePropBanner />
              </div>
            </div>
          </FadeInSection>
        </>
      )}
    </div>
  );
}
