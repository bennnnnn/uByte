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

const LANG_SEO_INTRO: Record<string, { whyLearn: string; whatYoullLearn: string; whoIsItFor: string }> = {
  go: {
    whyLearn: "Go (Golang), created by Google, is one of the fastest-growing programming languages for backend development, cloud infrastructure, and DevOps. Companies like Google, Uber, Dropbox, and Twitch use Go for its simplicity, blazing-fast compilation, and built-in concurrency. Whether you want to build web servers, microservices, CLI tools, or distributed systems, Go is an excellent choice.",
    whatYoullLearn: "This free, interactive Go course takes you from zero to production-ready. You'll master Go variables, data types, functions, control flow, structs, interfaces, pointers, goroutines, channels, error handling, JSON encoding, HTTP servers, testing, and packages — all by writing and running real Go code in your browser.",
    whoIsItFor: "Complete beginners who want their first programming language, developers switching from Python or JavaScript to a compiled language, and backend engineers preparing for Go coding interviews.",
  },
  python: {
    whyLearn: "Python is the world's most popular programming language — used in web development, data science, machine learning, automation, and scripting. Companies like Google, Netflix, Instagram, and Spotify rely on Python. Its clean syntax makes it the ideal first language, and its vast ecosystem means you can build almost anything.",
    whatYoullLearn: "This free, interactive Python course covers variables, data types, control flow, loops, functions, lists, dictionaries, tuples, classes, inheritance, encapsulation, dunder methods, dataclasses, generators, modules, error handling, JSON, HTTP requests, and async programming — all by writing and running real Python code in your browser.",
    whoIsItFor: "Absolute beginners learning to code for the first time, developers who want to add Python to their toolkit, and anyone preparing for Python coding interviews or data science roles.",
  },
  cpp: {
    whyLearn: "C++ powers game engines, operating systems, embedded systems, high-frequency trading, and performance-critical applications. Companies like Google, Microsoft, Apple, and Amazon use C++ for their most demanding systems. Learning C++ gives you deep understanding of how computers work — memory management, pointers, and low-level optimization.",
    whatYoullLearn: "This free, interactive C++ course covers variables, data types, control flow, loops, functions, arrays, pointers, classes, objects, inheritance, polymorphism, templates, error handling, and modern C++ patterns — all by compiling and running real C++ code in your browser.",
    whoIsItFor: "Beginners who want to understand how programming really works at a low level, game developers, systems programmers, and engineers preparing for C++ coding interviews.",
  },
  javascript: {
    whyLearn: "JavaScript is the language of the web — every website you visit runs JavaScript. It's the only language that works in both the browser and on the server (via Node.js). Companies like Meta, Google, Netflix, and Airbnb build their products with JavaScript. Learning JavaScript opens doors to frontend, backend, and full-stack development.",
    whatYoullLearn: "This free, interactive JavaScript course covers variables, data types, functions, arrays, objects, control flow, loops, DOM manipulation, async/await, promises, modules, error handling, JSON, and HTTP requests — all by writing and running real JavaScript code in your browser.",
    whoIsItFor: "Anyone who wants to build websites and web apps, aspiring full-stack developers, and engineers preparing for JavaScript or frontend coding interviews.",
  },
  java: {
    whyLearn: "Java runs on billions of devices worldwide and is the backbone of enterprise software, Android apps, and large-scale distributed systems. Companies like Amazon, LinkedIn, Google, and major banks use Java for mission-critical applications. Java's strong type system and vast ecosystem make it one of the most in-demand languages in the job market.",
    whatYoullLearn: "This free, interactive Java course covers variables, data types, control flow, loops, functions, classes, objects, inheritance, interfaces, collections, error handling, JSON processing, and concurrency — all by compiling and running real Java code in your browser.",
    whoIsItFor: "Beginners who want a rock-solid language for career development, Android developers, enterprise engineers, and anyone preparing for Java coding interviews.",
  },
  rust: {
    whyLearn: "Rust is the most loved programming language seven years running. It combines the performance of C++ with memory safety guarantees — no garbage collector, no null pointer exceptions, no data races. Companies like Mozilla, Cloudflare, Discord, and AWS use Rust for systems programming, web infrastructure, and game engines.",
    whatYoullLearn: "This free, interactive Rust course covers variables, data types, ownership, borrowing, lifetimes, structs, enums, pattern matching, traits, error handling, generics, concurrency, and modules — all by compiling and running real Rust code in your browser.",
    whoIsItFor: "Developers who want to write fast, safe, and reliable code, systems programmers moving away from C/C++, and engineers preparing for Rust coding interviews.",
  },
  csharp: {
    whyLearn: "C# is Microsoft's flagship language, powering .NET web apps, Unity game development, desktop applications, and cloud services on Azure. Companies like Microsoft, Stack Overflow, and thousands of game studios use C#. Its modern features — LINQ, async/await, pattern matching — make it productive and enjoyable to write.",
    whatYoullLearn: "This free, interactive C# course covers variables, data types, control flow, loops, functions, classes, inheritance, interfaces, LINQ, async/await, error handling, and .NET patterns — all by compiling and running real C# code in your browser.",
    whoIsItFor: "Aspiring game developers (Unity), .NET web developers, Windows application developers, and engineers preparing for C# coding interviews.",
  },
};

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
      `${config.name} w3schools alternative`,
      `${config.name} codecademy alternative`,
      `learn ${config.name} interactive`,
      `${config.name} tutorial with exercises`,
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

  const intro = LANG_SEO_INTRO[lang];

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

      {/* Server-rendered SEO content — crawlable text for search engines */}
      {intro && tutorials.length > 0 && (
        <article className="mt-16 space-y-10 border-t border-zinc-200 pt-12 dark:border-zinc-800">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Why learn {config.name}?
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {intro.whyLearn}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              What you&apos;ll learn in this {config.name} tutorial
            </h2>
            <p className="mb-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {intro.whatYoullLearn}
            </p>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {tutorials.length} topics · {totalLessons} hands-on lessons · all levels
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {config.name} tutorial topics
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {tutorials.map((t, i) => (
                <li key={t.slug}>
                  <Link
                    href={tutorialUrl(lang, t.slug)}
                    className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {i + 1}
                    </span>
                    <span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                        {t.description.slice(0, 80)}{t.description.length > 80 ? "…" : ""}
                        {" · "}{stepCountBySlug[t.slug] ?? 0} lessons · {t.estimatedMinutes} min
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Who is this {config.name} course for?
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {intro.whoIsItFor}
            </p>
          </section>

          <nav className="flex flex-wrap gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800" aria-label="Related resources">
            <Link href={`/practice/${lang}`} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300">
              {config.name} Interview Prep →
            </Link>
            <Link href={`/certifications/${lang}`} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300">
              {config.name} Certification →
            </Link>
            <Link href="/daily" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300">
              Daily Challenge →
            </Link>
          </nav>
        </article>
      )}
    </div>
  );
}
