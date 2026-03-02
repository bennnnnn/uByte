import { notFound } from "next/navigation";
import {
  getAllTutorials,
  getTutorialBySlug,
  getAdjacentTutorials,
} from "@/lib/tutorials";
import InteractiveTutorial from "@/components/InteractiveTutorial";
import TutorialRating from "@/components/TutorialRating";
import TutorialDiscussion from "@/components/TutorialDiscussion";
import { getSteps, getAllStepsForLanguage } from "@/lib/tutorial-steps";
import { FREE_TUTORIAL_LIMIT } from "@/lib/plans";
import { getLanguageConfig, isSupportedLanguage } from "@/lib/languages/registry";
import { BASE_URL, APP_NAME } from "@/lib/constants";
import { tutorialCanonicalUrl } from "@/lib/urls";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  const langs = ["go", "python", "cpp", "javascript"] as const;
  for (const lang of langs) {
    if (!isSupportedLanguage(lang)) continue;
    const tutorials = getAllTutorials(lang);
    for (const t of tutorials) {
      params.push({ lang, slug: t.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLanguage(lang)) return { title: "Not Found" };

  const tutorial = getTutorialBySlug(slug, lang);
  if (!tutorial) return { title: "Not Found" };

  const config = getLanguageConfig(lang)!;
  const canonicalUrl = tutorialCanonicalUrl(BASE_URL, lang, slug);
  const ogTitle = `${tutorial.title} | ${APP_NAME}`;
  const description = `${tutorial.description} Free interactive ${config.name} tutorial with live code examples on ${APP_NAME}.`;

  const keywords = [
    tutorial.title,
    `${tutorial.title} ${config.name}`,
    `${config.name} tutorial`,
    `learn ${config.name}`,
    `${config.name} programming`,
    `${config.name} for beginners`,
    `interactive ${config.name}`,
    APP_NAME,
    tutorial.difficulty,
  ];

  return {
    title: tutorial.title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName: APP_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isSupportedLanguage(lang)) notFound();

  const tutorial = getTutorialBySlug(slug, lang);
  if (!tutorial) notFound();

  const config = getLanguageConfig(lang)!;
  const { prev, next } = getAdjacentTutorials(slug, lang);
  const allStepsForLang = getAllStepsForLanguage(lang);
  const steps = getSteps(lang, slug);
  const allTutorials = getAllTutorials(lang).map(
    ({ slug: s, title, order, difficulty, estimatedMinutes }) => ({
      slug: s,
      title,
      order,
      difficulty,
      estimatedMinutes,
    })
  );
  const allTutorialSteps: Record<string, { index: number; title: string }[]> =
    {};
  for (const t of allTutorials) {
    allTutorialSteps[t.slug] = (allStepsForLang[t.slug] ?? []).map((s, i) => ({
      index: i,
      title: s.title,
    }));
  }

  const canonicalUrl = tutorialCanonicalUrl(BASE_URL, lang, slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: tutorial.title,
    description: tutorial.description,
    url: canonicalUrl,
    author: { "@type": "Organization", name: APP_NAME },
    publisher: { "@type": "Organization", name: APP_NAME, url: BASE_URL },
    inLanguage: "en",
    isPartOf: {
      "@type": "Course",
      name: config.seo.defaultTitle,
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InteractiveTutorial
        lang={lang}
        tutorialTitle={tutorial.title}
        tutorialSlug={slug}
        steps={steps}
        allTutorials={allTutorials}
        allTutorialSteps={allTutorialSteps}
        prev={prev ? { slug: prev.slug, title: prev.title } : null}
        next={next ? { slug: next.slug, title: next.title } : null}
        currentOrder={tutorial.order}
        totalTutorials={allTutorials.length}
        isFree={tutorial.order <= FREE_TUTORIAL_LIMIT}
      />
      <div className="px-6 pb-8">
        <TutorialRating lang={lang} tutorialSlug={slug} />
        <TutorialDiscussion lang={lang} tutorialSlug={slug} />
      </div>
    </>
  );
}
