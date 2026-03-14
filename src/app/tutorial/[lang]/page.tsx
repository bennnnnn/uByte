import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getLanguageConfig, isSupportedLanguage, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getSteps, getTotalLessonCount } from "@/lib/tutorial-steps";
import { APP_NAME } from "@/lib/constants";
import { tutorialUrl, tutorialLangUrl } from "@/lib/urls";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";
import TutorialGrid from "@/components/TutorialGrid";
import TutorialLangHero from "@/components/tutorial/TutorialLangHero";
import type { SupportedLanguage } from "@/lib/languages/types";

export async function generateStaticParams() {
  return getAllLanguageSlugs().map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) return { title: "Not Found" };
  const config = getLanguageConfig(lang)!;
  const canonical = absoluteUrl(tutorialLangUrl(lang));
  return {
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    keywords: [
      ...config.seo.keywords,
      `${config.name} course`,
      `${config.name} certification prep`,
      `${config.name} interview prep`,
      `${config.name} coding tutorial`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      url: canonical,
      siteName: APP_NAME,
      locale: "en_US",
      images: [{ url: absoluteUrl(`/api/og?title=${encodeURIComponent(`Learn ${config.name}`)}&description=${encodeURIComponent(`Interactive ${config.name} tutorials with live code examples`)}`), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
    },
  };
}

export default async function TutorialLangLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) notFound();
  const config = getLanguageConfig(lang)!;
  const tutorials = getAllTutorials(lang as SupportedLanguage);

  // Total lessons — same function used by LangCard on the home page,
  // so the two numbers are always identical.
  const totalLessons = getTotalLessonCount(lang as SupportedLanguage);

  // Per-slug step counts so the client can sum completed lessons
  // (progress[] holds completed topic slugs, not individual steps).
  const stepCountBySlug = Object.fromEntries(
    tutorials.map((t) => [t.slug, getSteps(lang as SupportedLanguage, t.slug).length])
  );
  const canonical = absoluteUrl(tutorialLangUrl(lang));
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${config.name} Programming Course`,
    description: config.seo.defaultDescription,
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
    },
    url: canonical,
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: `${config.name} Tutorials`, path: tutorialLangUrl(lang) },
  ]);
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${config.name} tutorial lessons`,
    itemListElement: tutorials.map((tutorial, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tutorial.title,
      url: absoluteUrl(tutorialUrl(lang, tutorial.slug)),
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([courseJsonLd, breadcrumbJsonLd, listJsonLd]),
        }}
      />

      <TutorialLangHero config={config} firstSlug={tutorials[0]?.slug ?? null} />

      {tutorials.length > 0 ? (
        <>
          <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            All Tutorials
          </h2>
          <TutorialGrid lang={lang} tutorials={tutorials} stepCountBySlug={stepCountBySlug} totalLessons={totalLessons} />
        </>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 px-8 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            {config.name} tutorials are coming soon
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We&apos;re building interactive {config.name} lessons. In the meantime, try our{" "}
            <Link href={tutorialLangUrl("go")} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Go tutorials
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
