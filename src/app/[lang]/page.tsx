import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getLanguageConfig, isSupportedLanguage, getAllLanguageSlugs } from "@/lib/languages/registry";
import { BASE_URL, APP_NAME } from "@/lib/constants";
import { tutorialUrl } from "@/lib/urls";
import TutorialGrid from "@/components/TutorialGrid";
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
  const canonical = `${BASE_URL.replace(/\/$/, "")}/${lang}`;
  return {
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      url: canonical,
      siteName: APP_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
    },
  };
}

export default async function LanguageLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) notFound();
  const config = getLanguageConfig(lang)!;
  const tutorials = getAllTutorials(lang as SupportedLanguage);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-14">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Learn {config.name} with uByte
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {config.seo.defaultDescription}
        </p>
        {tutorials.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={tutorialUrl(lang, tutorials[0].slug)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              Start Learning →
            </Link>
          </div>
        )}
      </div>

      {tutorials.length > 0 ? (
        <>
          <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            All Tutorials
          </h2>
          <TutorialGrid lang={lang} tutorials={tutorials} />
        </>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 px-8 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            {config.name} tutorials are coming soon
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We&apos;re building interactive {config.name} lessons. In the meantime, try our{" "}
            <Link href="/go" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Go tutorials
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
