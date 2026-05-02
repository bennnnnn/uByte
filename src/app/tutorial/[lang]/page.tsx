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
import { getTutorialRatingsByLang } from "@/lib/db/ratings";

const LANG_TRACK_META: Record<SupportedLanguage, { bestFor: string; audience: string[]; outcomes: string[] }> = {
  go: {
    bestFor: "Best for backend and systems basics",
    audience: ["Developers learning backend fundamentals", "Engineers interested in APIs and concurrency", "Learners who want a simple compiled language"],
    outcomes: ["Write Go syntax confidently", "Use structs, interfaces, and methods", "Work with goroutines and channels", "Build small services and CLIs"],
  },
  python: {
    bestFor: "Best for beginners",
    audience: ["Absolute beginners", "Learners exploring automation or scripting", "Developers moving toward backend or data work"],
    outcomes: ["Use variables, loops, and functions", "Work with lists and dictionaries", "Read and write Python modules", "Build small real scripts confidently"],
  },
  javascript: {
    bestFor: "Best for web development",
    audience: ["Aspiring frontend developers", "Learners building browser skills", "Developers who want one language for browser and server"],
    outcomes: ["Use functions, arrays, and objects", "Understand async JavaScript", "Work with DOM basics and APIs", "Build interactive web logic"],
  },
  typescript: {
    bestFor: "Best for JavaScript developers",
    audience: ["JavaScript developers adding types", "Frontend engineers scaling apps", "Learners who want safer JS habits"],
    outcomes: ["Write typed functions and objects", "Use interfaces and generics", "Model safer app data", "Build more maintainable JavaScript code"],
  },
  java: {
    bestFor: "Best for structured OOP learning",
    audience: ["Learners who want strong fundamentals", "Developers moving toward backend systems", "Anyone learning classic OOP patterns"],
    outcomes: ["Use Java syntax and control flow", "Build classes and interfaces", "Work with collections and errors", "Understand Java backend foundations"],
  },
  rust: {
    bestFor: "Best for systems thinking",
    audience: ["Developers learning lower-level concepts", "Engineers moving from C or C++", "Learners who want safe systems programming"],
    outcomes: ["Understand ownership and borrowing", "Use structs, enums, and traits", "Handle errors explicitly", "Write safe, fast systems code"],
  },
  cpp: {
    bestFor: "Best for performance-focused learning",
    audience: ["Learners exploring low-level programming", "Game and systems developers", "Engineers who care about memory and speed"],
    outcomes: ["Use core C++ syntax", "Understand pointers and classes", "Work with memory-sensitive patterns", "Build stronger systems intuition"],
  },
  csharp: {
    bestFor: "Best for .NET and Unity paths",
    audience: ["Developers learning the Microsoft stack", "Aspiring Unity developers", "Learners building structured app code"],
    outcomes: ["Use C# syntax and classes", "Work with interfaces and LINQ", "Handle async patterns", "Build confidence with .NET-style code"],
  },
  sql: {
    bestFor: "Best for data fundamentals",
    audience: ["Beginners learning databases", "Developers who need query skills", "Analysts building stronger SQL basics"],
    outcomes: ["Write SELECT, WHERE, and ORDER BY queries", "Use joins and aggregations", "Read relational data confidently", "Build practical database intuition"],
  },
};

const LANG_SEO_INTRO: Record<string, { whyLearn: string; whatYoullLearn: string; whoIsItFor: string }> = {
  go: {
    whyLearn: "Go (Golang), created by Google, is one of the fastest-growing programming languages for backend development, cloud infrastructure, and DevOps. Companies like Google, Uber, Dropbox, and Twitch use Go for its simplicity, blazing-fast compilation, and built-in concurrency. Whether you want to build web servers, microservices, CLI tools, or distributed systems, Go is an excellent choice.",
    whatYoullLearn: "This free, interactive Go course takes you from zero to production-ready. You'll master Go variables, data types, functions, control flow, structs, interfaces, pointers, goroutines, channels, error handling, JSON encoding, HTTP servers, testing, and packages — all by writing and running real Go code in your browser.",
    whoIsItFor: "Complete beginners who want their first programming language, developers switching from Python or JavaScript to a compiled language, and backend engineers who want a clear path into Go.",
  },
  python: {
    whyLearn: "Python is the world's most popular programming language — used in web development, data science, machine learning, automation, and scripting. Companies like Google, Netflix, Instagram, and Spotify rely on Python. Its clean syntax makes it the ideal first language, and its vast ecosystem means you can build almost anything.",
    whatYoullLearn: "This free, interactive Python course covers variables, data types, control flow, loops, functions, lists, dictionaries, tuples, classes, inheritance, encapsulation, dunder methods, dataclasses, generators, modules, error handling, JSON, HTTP requests, and async programming — all by writing and running real Python code in your browser.",
    whoIsItFor: "Absolute beginners learning to code for the first time, developers who want to add Python to their toolkit, and anyone building toward automation, backend, or data work.",
  },
  cpp: {
    whyLearn: "C++ powers game engines, operating systems, embedded systems, high-frequency trading, and performance-critical applications. Companies like Google, Microsoft, Apple, and Amazon use C++ for their most demanding systems. Learning C++ gives you deep understanding of how computers work — memory management, pointers, and low-level optimization.",
    whatYoullLearn: "This free, interactive C++ course covers variables, data types, control flow, loops, functions, arrays, pointers, classes, objects, inheritance, polymorphism, templates, error handling, and modern C++ patterns — all by compiling and running real C++ code in your browser.",
    whoIsItFor: "Beginners who want to understand how programming works at a low level, game developers, systems programmers, and engineers who care about performance.",
  },
  javascript: {
    whyLearn: "JavaScript is the language of the web — every website you visit runs JavaScript. It's the only language that works in both the browser and on the server (via Node.js). Companies like Meta, Google, Netflix, and Airbnb build their products with JavaScript. Learning JavaScript opens doors to frontend, backend, and full-stack development.",
    whatYoullLearn: "This free, interactive JavaScript course covers variables, data types, functions, arrays, objects, control flow, loops, DOM manipulation, async/await, promises, modules, error handling, JSON, and HTTP requests — all by writing and running real JavaScript code in your browser.",
    whoIsItFor: "Anyone who wants to build websites and web apps, aspiring full-stack developers, and engineers building modern frontend or Node.js skills.",
  },
  java: {
    whyLearn: "Java runs on billions of devices worldwide and is the backbone of enterprise software, Android apps, and large-scale distributed systems. Companies like Amazon, LinkedIn, Google, and major banks use Java for mission-critical applications. Java's strong type system and vast ecosystem make it one of the most in-demand languages in the job market.",
    whatYoullLearn: "This free, interactive Java course covers variables, data types, control flow, loops, functions, classes, objects, inheritance, interfaces, collections, error handling, JSON processing, and concurrency — all by compiling and running real Java code in your browser.",
    whoIsItFor: "Beginners who want a rock-solid language for career development, Android developers, enterprise engineers, and anyone growing into large-scale backend systems.",
  },
  rust: {
    whyLearn: "Rust is the most loved programming language seven years running. It combines the performance of C++ with memory safety guarantees — no garbage collector, no null pointer exceptions, no data races. Companies like Mozilla, Cloudflare, Discord, and AWS use Rust for systems programming, web infrastructure, and game engines.",
    whatYoullLearn: "This free, interactive Rust course covers variables, data types, ownership, borrowing, lifetimes, structs, enums, pattern matching, traits, error handling, generics, concurrency, and modules — all by compiling and running real Rust code in your browser.",
    whoIsItFor: "Developers who want to write fast, safe, and reliable code, systems programmers moving away from C/C++, and engineers who want stronger systems fundamentals.",
  },
  csharp: {
    whyLearn: "C# is Microsoft's flagship language, powering .NET web apps, Unity game development, desktop applications, and cloud services on Azure. Companies like Microsoft, Stack Overflow, and thousands of game studios use C#. Its modern features — LINQ, async/await, pattern matching — make it productive and enjoyable to write.",
    whatYoullLearn: "This free, interactive C# course covers variables, data types, control flow, loops, functions, classes, inheritance, interfaces, LINQ, async/await, error handling, and .NET patterns — all by compiling and running real C# code in your browser.",
    whoIsItFor: "Aspiring game developers (Unity), .NET web developers, Windows application developers, and developers building on the Microsoft stack.",
  },
  typescript: {
    whyLearn: "TypeScript is JavaScript with superpowers — it adds static types, interfaces, and powerful tooling to the world's most popular language. Companies like Microsoft, Airbnb, Slack, and Stripe use TypeScript to build large-scale applications with fewer bugs and better developer experience. If you know JavaScript, TypeScript is the natural next step. If you're starting fresh, TypeScript sets you up with professional-grade habits from day one.",
    whatYoullLearn: "This free, interactive TypeScript course covers type annotations, interfaces, type aliases, union and intersection types, generics, enums, classes, access modifiers, decorators, modules, utility types (Partial, Pick, Omit, Record), and strict null checking — all by writing and running real TypeScript code in your browser.",
    whoIsItFor: "JavaScript developers who want safer, more maintainable code, frontend engineers working with React or Angular, backend developers using Node.js, and anyone moving toward full-stack TypeScript.",
  },
  sql: {
    whyLearn: "SQL (Structured Query Language) is the universal language of data — every application that stores information uses it. Databases powered by SQL run at companies like Google, Amazon, Meta, and every bank, hospital, and e-commerce site on the planet. Knowing SQL is one of the most transferable skills in tech: it's required for software engineers, data analysts, data scientists, and product managers alike.",
    whatYoullLearn: "This free, interactive SQL course covers SELECT queries, filtering with WHERE, sorting with ORDER BY, aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY and HAVING, JOINs (INNER, LEFT, RIGHT, FULL), subqueries, CTEs, window functions, indexes, transactions, and database design — all by writing and running real SQL queries in your browser.",
    whoIsItFor: "Complete beginners who want to learn how to query databases, developers who need to work with data in their applications, data analysts and data scientists, and engineers building stronger data skills.",
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
  const trackMeta = LANG_TRACK_META[lang as SupportedLanguage];

  // Total lessons — same function used by LangCard on the home page,
  // so the two numbers are always identical.
  const totalLessons = getTotalLessonCount(lang as SupportedLanguage);
  const totalMinutes = tutorials.reduce((sum, tutorial) => sum + tutorial.estimatedMinutes, 0);
  const estimatedHours = Math.max(1, Math.round(totalMinutes / 60));
  const firstTutorial = tutorials[0] ?? null;

  // Per-slug step counts so the client can sum completed lessons
  // (progress[] holds completed topic slugs, not individual steps).
  const stepCountBySlug = Object.fromEntries(
    tutorials.map((t) => [t.slug, getSteps(lang as SupportedLanguage, t.slug).length])
  );

  // Fetch aggregate ratings for all tutorials in this language (best-effort)
  let ratingsBySlug: Record<string, { thumbs_up: number; thumbs_down: number }> = {};
  try {
    ratingsBySlug = await getTutorialRatingsByLang(lang);
  } catch { /* non-critical — show cards without ratings */ }

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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([courseJsonLd, breadcrumbJsonLd, listJsonLd]),
        }}
      />

      <TutorialLangHero
        config={config}
        firstSlug={firstTutorial?.slug ?? null}
        topicCount={tutorials.length}
        lessonCount={totalLessons}
        estimatedHours={estimatedHours}
        bestFor={trackMeta.bestFor}
        intro={intro?.whatYoullLearn ?? config.seo.defaultDescription}
      />

      <section className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-surface-card p-6 shadow-sm dark:border-zinc-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Who this is for
          </p>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            A clear path into {config.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {intro?.whoIsItFor}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {trackMeta.audience.map((item) => (
              <li key={item} className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-surface-card p-6 shadow-sm dark:border-zinc-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            What you&apos;ll build
          </p>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Skills that stack into real momentum
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {trackMeta.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {firstTutorial && (
        <div className="mb-10 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Start here
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {firstTutorial.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {firstTutorial.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <span className="rounded-full bg-white px-2.5 py-1 font-medium dark:bg-zinc-900">
                  {stepCountBySlug[firstTutorial.slug] ?? 0} lessons
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium dark:bg-zinc-900">
                  ~{firstTutorial.estimatedMinutes} min
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium capitalize dark:bg-zinc-900">
                  {firstTutorial.difficulty}
                </span>
              </div>
            </div>
            <Link
              href={tutorialUrl(lang, firstTutorial.slug)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Start this lesson →
            </Link>
          </div>
        </div>
      )}

      {tutorials.length > 0 ? (
        <>
          <div id="curriculum" className="mb-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Full curriculum
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Follow the track from first lesson to confident fundamentals
            </h2>
          </div>
          <TutorialGrid lang={lang} tutorials={tutorials} stepCountBySlug={stepCountBySlug} totalLessons={totalLessons} ratingsBySlug={ratingsBySlug} />
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

      {/* Server-rendered SEO content — crawlable text for search engines, hidden from users */}
      {intro && tutorials.length > 0 && (
        <div className="sr-only">
          <section>
            <h2>Why learn {config.name}?</h2>
            <p>{intro.whyLearn}</p>
          </section>
          <section>
            <h2>What you&apos;ll learn in this {config.name} tutorial</h2>
            <p>{intro.whatYoullLearn}</p>
          </section>
          <section>
            <h2>{config.name} tutorial topics</h2>
            <p>{tutorials.length} topics · {totalLessons} hands-on lessons · all levels</p>
          </section>
          <section>
            <h2>Who is this {config.name} course for?</h2>
            <p>{intro.whoIsItFor}</p>
          </section>
        </div>
      )}
    </div>
  );
}
