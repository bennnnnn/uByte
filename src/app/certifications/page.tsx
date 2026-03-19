import type { Metadata } from "next";
import Link from "next/link";
import { Card, Eyebrow, TextLink } from "@/components/ui";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getExamConfigForAllLangs, getUserExamStats, getExamPublicStatsByLang, DEFAULT_EXAM_CONFIG } from "@/lib/db";
import { EXAM_LANGS } from "@/lib/exams/config";
import { tutorialLangUrl } from "@/lib/urls";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import ExamCard from "./ExamCard";
import ScrollToTop from "@/components/ScrollToTop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programming Certification Exams — Get Certified in 7 Languages | uByte",
  description:
    "Prove your programming skills with timed certification exams. Take exams in Go, Python, JavaScript, Java, C++, Rust, and C# — earn verifiable certificates you can add to your LinkedIn and resume. Free practice, Pro for full exams.",
  keywords: [
    ...SITE_KEYWORDS,
    "programming certification exams",
    "coding certification",
    "programming certificate online",
    "coding certification practice",
    "technical assessment practice",
    "Go certification",
    "Python certification",
    "JavaScript certification",
    "Java certification",
    "C++ certification",
    "Rust certification",
    "C# certification",
    "online coding exam",
    "programming skills test",
    "developer certification",
    "verifiable coding certificate",
    "add coding certificate to LinkedIn",
    "coding assessment test",
    "timed programming exam",
  ],
  alternates: { canonical: absoluteUrl("/certifications") },
  openGraph: {
    title: "Programming Certification Exams — Get Certified in 7 Languages | uByte",
    description:
      "Timed certification exams in Go, Python, JavaScript, Java, C++, Rust, and C#. Pass to earn verifiable certificates for your resume.",
    type: "website",
    url: absoluteUrl("/certifications"),
    images: [{ url: absoluteUrl("/api/og?title=Certifications&description=Prove+your+skills+with+timed+exams+in+7+languages"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Programming Certification Exams | uByte",
    description: "Timed certification exams in Go, Python, JavaScript, Java, Rust, C++, and C#. Earn verifiable certificates for your LinkedIn and resume.",
  },
};

// ExamCard is now in ./ExamCard.tsx (shared with per-language detail pages)

/** Renders a grid of ExamCards for a list of language slugs. */
function ExamCardGrid({
  langs,
  examConfigByLang,
  statsByLang,
  publicStatsByLang,
  isLoggedIn,
  cols = 3,
}: {
  langs: string[];
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number }>;
  statsByLang: Record<string, { attemptCount: number; lastPassed: boolean | null; lastScore: number | null; bestScore: number | null; hasCertificate: boolean }>;
  publicStatsByLang: Record<string, { usersTaken: number; attemptsSubmitted: number; passRatePercent: number }>;
  isLoggedIn: boolean;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
      {langs.map((lang) => (
        <ExamCard
          key={lang}
          slug={lang}
          examConfig={examConfigByLang[lang] ?? DEFAULT_EXAM_CONFIG}
          stats={statsByLang[lang]}
          publicStats={publicStatsByLang[lang]}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PracticeExamsPage() {
  const [user, examConfigByLang, publicStats] = await Promise.all([
    getCurrentUser(),
    getExamConfigForAllLangs(),
    getExamPublicStatsByLang(),
  ]);

  // Certifications are free — any logged-in user can take exams
  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];
  const examStats = user ? await getUserExamStats(user.userId) : [];
  const statsByLang = Object.fromEntries(examStats.map((s) => [s.lang, s]));
  const publicStatsByLang = Object.fromEntries(publicStats.map((s) => [s.lang, s]));

  // Aggregate trust numbers for the hero bar
  const totalAttempts = publicStats.reduce((s, r) => s + r.attemptsSubmitted, 0);
  const totalCertificates = publicStats.reduce((s, r) => s + r.usersPassed, 0);

  // Per-user progress sections
  const tryAgainLangs = EXAM_LANGS.filter(
    (lang) => statsByLang[lang] && statsByLang[lang].attemptCount > 0
      && !statsByLang[lang].lastPassed && !statsByLang[lang].hasCertificate
  );
  const passedLangs = EXAM_LANGS.filter((lang) => statsByLang[lang]?.hasCertificate);

  // Languages the Pro user hasn't attempted yet
  const unattemptedLangs = EXAM_LANGS.filter((lang) => !statsByLang[lang] || statsByLang[lang].attemptCount === 0);

  // Pick a suggested language: first failed > first unattempted > first overall
  const suggestedLang = tryAgainLangs[0] ?? unattemptedLangs[0] ?? EXAM_LANGS[0];

  // Popular = langs with real attempt data, sorted by usage
  const popularLangs = EXAM_LANGS
    .filter((lang) => (publicStatsByLang[lang]?.attemptsSubmitted ?? 0) > 0)
    .sort((a, b) => (publicStatsByLang[b]?.attemptsSubmitted ?? 0) - (publicStatsByLang[a]?.attemptsSubmitted ?? 0))
    .slice(0, 3);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Programming certifications",
    url: absoluteUrl("/certifications"),
    hasPart: EXAM_LANGS.map((lang, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${LANGUAGES[lang]?.name ?? lang} certification`,
      url: absoluteUrl(`/certifications/${lang}`),
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do certifications work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each exam is timed, language-specific, and scored automatically. You can retake exams after each attempt.",
        },
      },
      {
        "@type": "Question",
        name: "Do I get a certificate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Passing an exam unlocks a shareable certificate for that language.",
        },
      },
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Certifications", item: absoluteUrl("/certifications") },
    ],
  };

  return (
    <div className="min-h-full">
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionJsonLd, faqJsonLd, breadcrumbJsonLd]),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-surface-card dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
                Programming Certifications
              </h1>
              <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
                Timed exams by language. Pass to earn a verifiable certificate that proves you know your stuff.
              </p>
            </div>

            {!user ? (
              /* Not logged in */
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup?next=/certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  Create free account
                </Link>
                <Link
                  href="/login?next=/certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                >
                  Log in
                </Link>
              </div>
            ) : passedLangs.length === EXAM_LANGS.length ? (
              /* Pro, all passed */
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  All certified!
                </span>
                <Link
                  href="/dashboard?tab=certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                >
                  View certificates
                </Link>
              </div>
            ) : tryAgainLangs.length > 0 ? (
              /* Pro, has failed exams */
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/certifications/${tryAgainLangs[0]}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  Retake {LANGUAGES[tryAgainLangs[0]]?.name} exam
                </Link>
                <a
                  href="#all-certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                >
                  All certifications
                </a>
              </div>
            ) : (
              /* Pro, no attempts yet (or some passed, some not attempted) */
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/certifications/${suggestedLang}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  {passedLangs.length > 0
                    ? `Next: ${LANGUAGES[suggestedLang]?.name} exam`
                    : "Start your first exam"}
                </Link>
                <a
                  href="#all-certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                >
                  Browse all
                </a>
              </div>
            )}
          </div>

          {/* Trust bar — only show stats with real data */}
          {(() => {
            const trustItems: { value: string; label: string }[] = [
              { value: String(EXAM_LANGS.length), label: "Languages" },
            ];
            if (totalAttempts > 0) trustItems.push({ value: totalAttempts.toLocaleString(), label: "Exams taken" });
            if (totalCertificates > 0) trustItems.push({ value: totalCertificates.toLocaleString(), label: "Certificates issued" });
            return (
              <div className={`mt-10 grid gap-4 border-t border-zinc-100 pt-8 dark:border-zinc-800 ${
                trustItems.length === 3 ? "grid-cols-3" : trustItems.length === 2 ? "grid-cols-2" : "grid-cols-1"
              }`}>
                {trustItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{item.value}</p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">

        {/* ── Learning journey OR progress dashboard ──────────────────────── */}
        {examStats.length > 0 ? (
          /* Progress dashboard for users with exam history */
          <section className="mb-14">
            <Eyebrow className="mb-6">
              Your progress
            </Eyebrow>
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {passedLangs.length} <span className="text-base font-normal text-zinc-400">/ {EXAM_LANGS.length} certified</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {examStats.reduce((s, e) => s + e.attemptCount, 0)} total attempts
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mb-6 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round((passedLangs.length / EXAM_LANGS.length) * 100)}%` }}
                />
              </div>
              {/* Per-language mini cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {EXAM_LANGS.map((lang) => {
                  const s = statsByLang[lang];
                  const passed = s?.hasCertificate;
                  const attempted = s && s.attemptCount > 0;
                  return (
                    <Link
                      key={lang}
                      href={`/certifications/${lang}`}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 ${
                        passed
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                          : attempted
                          ? "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <span className="text-xl">{getLangIcon(lang)}</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {LANGUAGES[lang]?.name}
                      </span>
                      {passed ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Certified</span>
                      ) : attempted && s?.bestScore != null ? (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Best: {s.bestScore}%</span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Not started</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </Card>
          </section>
        ) : (
          /* Learning journey for visitors / free users / Pro with no attempts */
          <section className="mb-14">
            <Eyebrow className="mb-6">
              Your path to certification
            </Eyebrow>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {/* Connector line (desktop only) */}
              <div className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-indigo-200 to-emerald-300 dark:from-indigo-800 dark:to-emerald-700 sm:block" />

              {[
                {
                  step: "1",
                  icon: "📖",
                  title: "Build understanding",
                  body: "Start with bite-sized tutorials. Master syntax, data structures, and core concepts at your own pace — then practice with hands-on coding challenges.",
                  link: "/tutorial",
                  linkLabel: "Browse tutorials",
                },
                {
                  step: "2",
                  icon: "🏆",
                  title: "Earn your certificate",
                  body: "Take a timed exam and pass. You'll get a verifiable digital certificate with a unique ID — share it anywhere.",
                  link: "#all-certifications",
                  linkLabel: "View certifications",
                },
              ].map(({ step, icon, title, body, link, linkLabel }) => (
                <Card key={step} className="relative p-6">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/40">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
                  {step === "2" && (
                    <div className="mt-4 overflow-hidden rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-zinc-800">
                      <div className="border-b border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-center dark:border-indigo-800/40 dark:bg-indigo-950/30">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Example certificate</span>
                      </div>
                      <div className="px-5 py-4 text-center">
                        <div className="mb-2 flex items-center justify-center gap-1.5">
                          <span className="text-base">🏆</span>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Certificate of Completion</p>
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">This certifies that</p>
                        <p className="mt-1 text-base font-extrabold text-zinc-800 dark:text-zinc-100">Alex Johnson</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">has successfully passed the</p>
                        <p className="mt-0.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">Go Language Certification</p>
                        <div className="mx-auto mt-3 h-px w-16 bg-indigo-200 dark:bg-indigo-700" />
                        <p className="mt-2 text-[9px] font-mono text-zinc-400 dark:text-zinc-500" suppressHydrationWarning>ubyte.dev/cert/a3f9b2c1 · {new Date().getFullYear()}</p>
                      </div>
                    </div>
                  )}
                  <TextLink
                    href={link}
                    className="mt-4 inline-flex text-sm"
                  >
                    {linkLabel} →
                  </TextLink>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── Popular certifications (only when real data exists) ───────────────────── */}
        {popularLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="popular-heading">
            <div className="mb-5 flex items-end justify-between">
              <Eyebrow id="popular-heading">
                Popular certifications
              </Eyebrow>
              <TextLink href="#all-certifications" className="text-sm">
                View all →
              </TextLink>
            </div>
            <ExamCardGrid langs={popularLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} />
          </section>
        )}

        {/* ── Try again (Pro user with failed attempts) ─────────────────────── */}
        {tryAgainLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="try-again-heading">
            <Eyebrow id="try-again-heading" className="mb-5">
              Give it another shot
            </Eyebrow>
            <ExamCardGrid langs={tryAgainLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} cols={2} />
          </section>
        )}

        {/* ── Passed langs ─────────────────────────────────────────────────── */}
        {passedLangs.length > 0 && (
          <section className="mb-14" aria-labelledby="passed-heading">
            <Eyebrow id="passed-heading" className="mb-5">
              You passed
            </Eyebrow>
            <ExamCardGrid langs={passedLangs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} cols={2} />
          </section>
        )}

        {/* ── All certifications ─────────────────────────────────────────────────────── */}
        <section id="all-certifications" aria-labelledby="all-heading">
          <Eyebrow id="all-heading" className="mb-5">
            All certifications
          </Eyebrow>
          <ExamCardGrid langs={langSlugs} examConfigByLang={examConfigByLang} statsByLang={statsByLang} publicStatsByLang={publicStatsByLang} isLoggedIn={!!user} />
        </section>

        {/* ── Why get certified? ───────────────────────────────────── */}
        <section className="mt-14 mb-0">
          <Eyebrow className="mb-6">
            Why get certified?
          </Eyebrow>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🎯",
                accent: "bg-indigo-50 dark:bg-indigo-950/40",
                iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
                title: "Validate your knowledge",
                body: "Timed exams test real understanding, not just memorization. Passing proves you can apply concepts under pressure.",
              },
              {
                icon: "📄",
                accent: "bg-emerald-50 dark:bg-emerald-950/30",
                iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
                title: "Strengthen your resume",
                body: "Add a verifiable credential to your resume. Each certificate has a unique ID that employers and recruiters can check.",
              },
              {
                icon: "🔗",
                accent: "bg-violet-50 dark:bg-violet-950/30",
                iconBg: "bg-violet-100 dark:bg-violet-900/40",
                title: "Share with anyone",
                body: "Every certificate has a public verification page. Share the link with recruiters, teammates, or on social media.",
              },
            ].map(({ icon, accent, iconBg, title, body }) => (
              <div key={title} className={`rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700 ${accent}`}>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${iconBg}`}>
                  {icon}
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────── */}
        {!user ? (
          <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Ready to prove your skills?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Create a free account and start taking certification exams — no subscription, no credit card.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup?next=/certifications"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Sign up free
              </Link>
              <Link
                href="/login?next=/certifications"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
              >
                Log in
              </Link>
            </div>
          </div>
        ) : passedLangs.length < EXAM_LANGS.length ? (
          <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Certifications are free to take</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              {passedLangs.length > 0
                ? `You've passed ${passedLangs.length} of ${EXAM_LANGS.length}. Keep going to complete the full set.`
                : tryAgainLangs.length > 0
                ? `You've already attempted the ${LANGUAGES[tryAgainLangs[0]]?.name} exam. Review the areas where you scored lower and try again.`
                : "Pick a language, take the timed exam, and earn a shareable certificate. Struggling? Our tutorials cover exactly what the exams test."}
            </p>
            <div className="mt-6">
              <Link
                href={`/certifications/${suggestedLang}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                {tryAgainLangs.length > 0
                  ? `Retake ${LANGUAGES[tryAgainLangs[0]]?.name} exam`
                  : passedLangs.length > 0
                  ? `Next: ${LANGUAGES[suggestedLang]?.name} exam`
                  : "Browse certifications"}
              </Link>
            </div>
          </div>
        ) : null}

        {/* ── Footer nav ────────────────────────────────────────────────────── */}
        <nav
          className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zinc-200 pt-8 text-sm dark:border-zinc-800"
          aria-label="Quick links"
        >
          <Link href="/" className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
            Home
          </Link>
          {langSlugs.map((slug) => {
            const config = LANGUAGES[slug];
            if (!config) return null;
            return (
              <Link key={slug} href={tutorialLangUrl(slug)} className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                {config.name} tutorials
              </Link>
            );
          })}
          <TextLink href="/certifications">
            Certifications →
          </TextLink>
        </nav>
      </div>
    </div>
  );
}
