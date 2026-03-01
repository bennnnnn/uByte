import { notFound } from "next/navigation";
import {
  getAllTutorials,
  getTutorialBySlug,
  getAdjacentTutorials,
} from "@/lib/tutorials";
import InteractiveTutorial from "@/components/InteractiveTutorial";
import TutorialRating from "@/components/TutorialRating";
import { allSteps } from "@/lib/tutorial-steps";
import { FREE_TUTORIAL_LIMIT } from "@/lib/plans";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllTutorials().map((t) => ({ slug: t.slug }));
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://golang-tutorials.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);
  if (!tutorial) return { title: "Not Found" };

  const url = `${BASE_URL}/golang/${slug}`;
  const ogTitle = `${tutorial.title} | uByte`;
  const description = `${tutorial.description} Free interactive Go tutorial with live code examples on uByte.`;

  return {
    title: tutorial.title,
    description,
    keywords: [
      tutorial.title,
      `${tutorial.title} Go`,
      `${tutorial.title} Golang`,
      "Go tutorial", "learn Go", "Golang tutorial",
      "Go programming", "Go for beginners", "interactive Go",
      "uByte", tutorial.difficulty,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: ogTitle,
      description,
      url,
      siteName: "uByte",
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);
  if (!tutorial) notFound();

  const { prev, next } = getAdjacentTutorials(slug);
  const steps = allSteps[slug] ?? [];
  const allTutorials = getAllTutorials().map(({ slug: s, title, order, difficulty, estimatedMinutes }) => ({
    slug: s,
    title,
    order,
    difficulty,
    estimatedMinutes,
  }));
  const allTutorialSteps: Record<string, { index: number; title: string }[]> = {};
  for (const t of allTutorials) {
    allTutorialSteps[t.slug] = (allSteps[t.slug] ?? []).map((s, i) => ({
      index: i,
      title: s.title,
    }));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: tutorial.title,
    description: tutorial.description,
    url: `${BASE_URL}/golang/${slug}`,
    author: { "@type": "Organization", name: "uByte" },
    publisher: { "@type": "Organization", name: "uByte", url: BASE_URL },
    inLanguage: "en",
    isPartOf: {
      "@type": "Course",
      name: "uByte — Learn Go for Free",
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
        <TutorialRating tutorialSlug={slug} />
      </div>
    </>
  );
}
