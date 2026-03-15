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
import { getLanguageConfig, isSupportedLanguage, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { BASE_URL, APP_NAME } from "@/lib/constants";
import { tutorialCanonicalUrl } from "@/lib/urls";
import { buildBreadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of ALL_LANGUAGE_KEYS) {
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

  const config = getLanguageConfig(lang);
  if (!config) return { title: "Not Found" };
  const canonicalUrl = tutorialCanonicalUrl(BASE_URL, lang, slug);
  const title = `${config.name} ${tutorial.title} Tutorial — Learn ${tutorial.title} in ${config.name}`;
  const ogTitle = `${config.name} ${tutorial.title} Tutorial | ${APP_NAME}`;
  const description = `Learn ${config.name} ${tutorial.title.toLowerCase()} step by step. ${tutorial.description} Free interactive ${config.name} tutorial with hands-on coding exercises and instant feedback on ${APP_NAME}.`;

  const conceptKeywords = (tutorial.subtopics ?? []).map(
    (s: { id: string; title: string }) => `${config.name} ${s.title}`
  );
  const keywords = [
    `${config.name} ${tutorial.title.toLowerCase()}`,
    `${config.name} ${tutorial.title.toLowerCase()} tutorial`,
    `${tutorial.title.toLowerCase()} in ${config.name}`,
    `learn ${config.name} ${tutorial.title.toLowerCase()}`,
    `${config.name} ${tutorial.title.toLowerCase()} for beginners`,
    `${config.name} ${tutorial.title.toLowerCase()} examples`,
    `${config.name} tutorial`,
    `${config.name} course`,
    `learn ${config.name}`,
    `${config.name} programming`,
    `${config.name} for beginners`,
    `interactive ${config.name} tutorial`,
    `${config.name} coding exercises`,
    ...conceptKeywords,
    APP_NAME,
  ];

  return {
    title,
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
      images: [{ url: absoluteUrl(`/api/og?title=${encodeURIComponent(`${config.name}: ${tutorial.title}`)}&description=${encodeURIComponent(`Interactive ${config.name} ${tutorial.title.toLowerCase()} tutorial`)}`), width: 1200, height: 630 }],
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

  const config = getLanguageConfig(lang);
  if (!config) notFound();
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
    headline: `${config.name} Tutorial: ${tutorial.title}`,
    description: tutorial.description,
    url: canonicalUrl,
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: APP_NAME },
    publisher: { "@type": "Organization", name: APP_NAME, url: BASE_URL },
    inLanguage: "en",
    isPartOf: {
      "@type": "Course",
      name: config.seo.defaultTitle,
      url: absoluteUrl(`/tutorial/${lang}`),
    },
    hasPart: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.instruction.split("\n")[0],
    })),
    timeRequired: `PT${tutorial.estimatedMinutes}M`,
    educationalLevel: tutorial.difficulty,
    teaches: tutorial.description,
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: `${config.name} Tutorials`, path: `/tutorial/${lang}` },
    { name: tutorial.title, path: `/tutorial/${lang}/${slug}` },
  ]);

  // Build SEO content: server-rendered HTML that Google can crawl.
  // The interactive IDE is a full-screen client component — its content is invisible to crawlers.
  // This section provides the textual substance Google needs to index the page.
  const langName = config.name;
  const { prev: prevTutorial, next: nextTutorial } = { prev, next };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbJsonLd]),
        }}
      />
      <InteractiveTutorial
        lang={lang}
        tutorialTitle={tutorial.title}
        tutorialSlug={slug}
        steps={steps}
        allTutorials={allTutorials}
        allTutorialSteps={allTutorialSteps}
        next={next ? { slug: next.slug, title: next.title } : null}
        isFree={tutorial.order <= FREE_TUTORIAL_LIMIT}
      />

      {/* Server-rendered SEO content — crawlable by Google, visible below the IDE */}
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {langName} Tutorial: {tutorial.title}
        </h1>
        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
          {tutorial.description}
        </p>

        {tutorial.content && (
          <div className="prose prose-zinc mb-8 max-w-none dark:prose-invert">
            {tutorial.content.split("\n").filter(Boolean).map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="mt-6 mb-3 text-xl font-semibold text-zinc-800 dark:text-zinc-200">{line.replace(/^## /, "")}</h2>;
              if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-indigo-300 pl-4 italic text-zinc-600 dark:border-indigo-700 dark:text-zinc-400">{line.replace(/^> \*?/, "").replace(/\*$/, "")}</blockquote>;
              return <p key={i} className="mb-3 text-zinc-700 dark:text-zinc-300">{line}</p>;
            })}
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            What you&apos;ll learn in this {langName} {tutorial.title.toLowerCase()} tutorial
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            This interactive {langName} tutorial has {steps.length} hands-on exercises.
            {tutorial.estimatedMinutes && ` Estimated time: ${tutorial.estimatedMinutes} minutes.`}
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            {steps.map((step, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <strong>{step.title}</strong>
                {step.instruction && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {" — "}{step.instruction.split("\n")[0].slice(0, 120)}
                    {step.instruction.split("\n")[0].length > 120 ? "…" : ""}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>

        {tutorial.subtopics?.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              {langName} {tutorial.title} concepts covered
            </h2>
            <ul className="flex flex-wrap gap-2">
              {tutorial.subtopics.map((t) => (
                <li key={t.id} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {t.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800" aria-label="Tutorial navigation">
          {prevTutorial ? (
            <a href={`/tutorial/${lang}/${prevTutorial.slug}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              ← {prevTutorial.title}
            </a>
          ) : <span />}
          {nextTutorial ? (
            <a href={`/tutorial/${lang}/${nextTutorial.slug}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              {nextTutorial.title} →
            </a>
          ) : <span />}
        </nav>
      </article>

      <div className="px-6 pb-8">
        <TutorialRating lang={lang} tutorialSlug={slug} />
        <TutorialDiscussion lang={lang} tutorialSlug={slug} />
      </div>
    </>
  );
}
