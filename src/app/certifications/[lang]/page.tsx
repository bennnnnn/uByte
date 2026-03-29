import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { notFound } from "next/navigation";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getExamConfigForLang, getExamConfigForAllLangs, getProgressCount, getUserExamStats, getExamPublicStatsByLang, getUserById } from "@/lib/db";
import { getAllTutorials } from "@/lib/tutorials";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { getLangIcon } from "@/lib/languages/icons";
import { getExamDetailContent } from "@/lib/exams/content";
import { absoluteUrl, buildBreadcrumbJsonLd, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";
import StartExamButton from "./StartExamButton";
import ExamDetailTabs from "./ExamDetailTabs";
import OtherExamsGrid from "./OtherExamsGrid";

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export const dynamic = "force-dynamic";

const VALID_LANGS = new Set(getAllLanguageSlugs());

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) return { title: "Not found" };
  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const examConfig = await getExamConfigForLang(lang);
  const canonical = absoluteUrl(`/certifications/${lang}`);
  const title = `${name} Certification Exam — Prove Your ${name} Skills`;
  const description = `Take the ${name} certification exam: ${examConfig.examSize} questions in ${examConfig.examDurationMinutes} minutes. Score ${examConfig.passPercent}%+ to earn a verifiable ${name} certificate for your LinkedIn and resume. Practice with free ${name} tutorials first.`;
  return {
    title,
    description,
    keywords: [
      ...SITE_KEYWORDS,
      `${name} certification`,
      `${name} certification exam`,
      `${name} certificate`,
      `${name} skills test`,
      `${name} programming test`,
      `${name} online exam`,
      `${name} assessment`,
      `${name} certification online`,
      `get ${name} certified`,
      `${name} certificate for LinkedIn`,
      `${name} interview prep`,
      `${name} coding test`,
      `verify ${name} skills`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${name} Certification Exam | uByte`,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(`/api/og?title=${encodeURIComponent(`${name} Certification`)}&description=${encodeURIComponent(`Timed ${name} exam — earn a verifiable certificate`)}`), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} Certification Exam | uByte`,
      description,
    },
  };
}

export default async function PracticeExamLangPage({ params }: Props) {
  const { lang } = await params;
  if (!VALID_LANGS.has(lang)) notFound();

  const [user, examConfig, examConfigByLang, publicStats] = await Promise.all([
    getCurrentUser(),
    getExamConfigForLang(lang),
    getExamConfigForAllLangs(),
    getExamPublicStatsByLang(),
  ]);
  const dbUser = user ? await getUserById(user.userId) : null;
  const emailVerified = !!dbUser?.email_verified;
  // Certifications require a verified email — ensures the certificate is tied to a real address
  const canTakeExam = !!user && emailVerified;

  // totalLessons — individual steps, matches the number shown on LangCard / tutorial page.
  // totalTopics  — number of tutorial topics; getProgressCount also returns a topic count,
  //                so the progress bar uses topics/topics (apples to apples).
  const totalLessons = getTotalLessonCount(lang as SupportedLanguage);
  const totalTopics = getAllTutorials(lang as SupportedLanguage).length;
  const completedTutorials = user ? await getProgressCount(user.userId, lang) : 0;
  const hasStartedTutorials = completedTutorials > 0;

  const examStats = user ? await getUserExamStats(user.userId) : [];
  const userLangStats = examStats.find((s) => s.lang === lang);
  const statsByLang = Object.fromEntries(examStats.map((s) => [s.lang, s]));
  const publicStatsByLang = Object.fromEntries(publicStats.map((s) => [s.lang, s]));
  const langPublicStats = publicStatsByLang[lang];

  const config = LANGUAGES[lang as SupportedLanguage];
  const name = config?.name ?? lang;
  const EXAM_PASS_PERCENT = examConfig.passPercent;
  const content = getExamDetailContent(lang, examConfig, EXAM_PASS_PERCENT);
  const langSlugs = getAllLanguageSlugs();
  const passMin = Math.ceil((examConfig.examSize * EXAM_PASS_PERCENT) / 100);
  const faqItems =
    content?.faq ?? [
      {
        question: "How long is the exam?",
        answer: `${examConfig.examDurationMinutes} minutes. The timer starts when you begin and cannot be paused.`,
      },
      {
        question: "How many questions are there?",
        answer: `${examConfig.examSize} multiple-choice questions. You need ${EXAM_PASS_PERCENT}% or higher to pass.`,
      },
    ];
  const examJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: `${name} Certification`,
    description:
      content?.objective ??
      `Timed ${name} multiple-choice exam with a certificate awarded on passing score.`,
    url: absoluteUrl(`/certifications/${lang}`),
    credentialCategory: "certificate",
  };
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Certifications", path: "/certifications" },
    { name: `${name} Certification Exam`, path: `/certifications/${lang}` },
  ]);

  return (
    <div className="min-h-full overflow-y-auto">
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([examJsonLd, faqJsonLd, breadcrumbJsonLd]),
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-surface-card dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: identity + tagline + stat chips */}
            <div className="flex items-start gap-3 sm:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-white text-2xl dark:border-zinc-700/60 dark:bg-zinc-800 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-3xl">
                {getLangIcon(lang)}
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                  {name} Certification Exam
                </h1>
                <p className="mt-2 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
                  {content?.tagline ?? `Prove your ${name} knowledge. Pass to earn a verifiable certificate for your resume and LinkedIn.`}
                </p>

                {/* Quick stats — compact icon+label rows on mobile, chips on desktop */}
                <div className="mt-3 sm:mt-5">
                  {/* Mobile: clean list */}
                  <ul className="space-y-1.5 sm:hidden">
                    {[
                      { icon: "❓", text: `${examConfig.examSize} questions` },
                      { icon: "⏱", text: `${examConfig.examDurationMinutes} min time limit` },
                      { icon: "✅", text: `${passMin} correct to pass (${EXAM_PASS_PERCENT}%)` },
                      { icon: "🏆", text: "Certificate on pass" },
                      { icon: "🆓", text: "100% Free" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="w-5 text-center text-base leading-none">{icon}</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                  {/* Desktop: pill chips */}
                  <div className="hidden flex-wrap gap-2 sm:flex">
                    {[
                      `${examConfig.examSize} questions`,
                      `${examConfig.examDurationMinutes} min`,
                      `${passMin} correct to pass (${EXAM_PASS_PERCENT}%)`,
                      "Certificate on pass",
                      "100% Free",
                    ].map((label) => (
                      <span
                        key={label}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
                          label === "100% Free"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats bar ────────────────────────────────────────────────── */}
          {(() => {
            const stats: { value: string; label: string }[] = [];
            if (langPublicStats && langPublicStats.attemptsSubmitted > 0) {
              stats.push({ value: langPublicStats.attemptsSubmitted.toLocaleString(), label: "Attempts" });
              stats.push({ value: `${langPublicStats.passRatePercent}%`, label: "Pass rate" });
              stats.push({ value: langPublicStats.usersPassed.toLocaleString(), label: "Certified" });
            }
            if (userLangStats && userLangStats.attemptCount > 0) {
              stats.push({ value: String(userLangStats.attemptCount), label: "Your attempts" });
              if (userLangStats.bestScore != null) stats.push({ value: `${userLangStats.bestScore}%`, label: "Your best" });
            }
            if (stats.length === 0) return null;
            return (
              // Responsive grid: 2 cols on mobile so ~5 stats don't squeeze into 60px columns
              <div className={`mt-8 grid gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 ${
                stats.length >= 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : stats.length >= 4 ? "grid-cols-2 sm:grid-cols-4"
                : stats.length === 3 ? "grid-cols-2 sm:grid-cols-3"
                : stats.length === 2 ? "grid-cols-2"
                : "grid-cols-1"
              }`}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Tutorial suggestion (non-blocking) ────────────────────────── */}
      {user && !hasStartedTutorials && totalTopics > 0 && (
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/50 dark:bg-amber-950/20">
            <span className="mt-0.5 text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                New to {name}? Our interactive tutorials can help you prepare.
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {totalLessons} hands-on lessons cover the core concepts tested in this exam. Totally optional — take the exam whenever you&apos;re ready.
              </p>
            </div>
            <Link
              href={`/tutorial/${lang}`}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-zinc-800"
            >
              View tutorials
            </Link>
          </div>
        </div>
      )}

      {/* ── Tutorial progress (partially completed) ────────────────────── */}
      {user && hasStartedTutorials && completedTutorials < totalTopics && (
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-surface-card px-5 py-4 dark:border-zinc-700">
            <span className="text-lg">📚</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                You&apos;ve completed {completedTutorials} of {totalTopics} {name} tutorials
              </p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.round((completedTutorials / totalTopics) * 100)}%` }}
                />
              </div>
            </div>
            <Link
              href={`/tutorial/${lang}`}
              className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Continue learning
            </Link>
          </div>
        </div>
      )}

      {/* ── Body: main content + sticky sidebar ─────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-14">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_300px] lg:items-start">

          {/* ── Left: tabs (overview, topics, FAQ) ──────────────────────── */}
          <div className="order-2 min-w-0 lg:order-1">
            <ExamDetailTabs
              langName={name}
              content={content}
              examSize={examConfig.examSize}
              examDurationMinutes={examConfig.examDurationMinutes}
              passPercent={EXAM_PASS_PERCENT}
            />
          </div>

          {/* ── Right: sticky CTA card ───────────────────────────────────── */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
            <Card className="overflow-hidden">
              {/* Card top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-400" />

              <div className="p-6">
                {canTakeExam && userLangStats?.hasCertificate ? (
                  /* Already certified */
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-900/40">✓</span>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Certified</p>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      You passed this exam. Your certificate is publicly verifiable and can be shared anytime. Want to beat your score? Retaking is optional.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <Link
                        href="/dashboard?tab=certifications"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                      >
                        View certificate
                      </Link>
                      <StartExamButton lang={lang} langName={name} fullWidth isRetake />
                    </div>
                  </>
                ) : canTakeExam && userLangStats && userLangStats.attemptCount > 0 ? (
                  /* Has attempted but not passed */
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Try again</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Your best score was <span className="font-semibold text-amber-600 dark:text-amber-400">{userLangStats.bestScore ?? 0}%</span>. You need {EXAM_PASS_PERCENT}% to pass.
                    </p>

                    <CheckList items={[
                      `${examConfig.examSize} randomised questions`,
                      `${examConfig.examDurationMinutes} min time limit`,
                      `${passMin} correct (${EXAM_PASS_PERCENT}%) to pass`,
                      "Certificate on pass",
                      "Unlimited retakes",
                    ]} />

                    <div className="mt-6">
                      <StartExamButton lang={lang} langName={name} fullWidth />
                    </div>
                  </>
                ) : canTakeExam ? (
                  /* Pro, no attempts yet */
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Ready to start?</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      The timer starts the moment you begin. You&apos;ll have {examConfig.examDurationMinutes} minutes.
                    </p>

                    <CheckList items={[
                      `${examConfig.examSize} randomised questions`,
                      `${examConfig.examDurationMinutes} min — can't be paused`,
                      `${passMin} correct (${EXAM_PASS_PERCENT}%) to pass`,
                      "Certificate on pass",
                      "Retake anytime",
                    ]} />

                    <div className="mt-6">
                      <StartExamButton lang={lang} langName={name} fullWidth />
                    </div>
                  </>
                ) : user && !emailVerified ? (
                  /* Logged in but email not verified */
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">One step away</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Verify your email to start the exam. Your certificate needs to be tied to a real address so it&apos;s verifiable.
                    </p>
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Check your inbox</p>
                      <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/70">
                        We sent a verification link to <span className="font-semibold">{dbUser?.email}</span>. Click it and then come back here.
                      </p>
                    </div>
                    <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      Didn&apos;t get it?{" "}
                      <Link href="/settings" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Resend from settings
                      </Link>
                    </p>
                  </>
                ) : (
                  /* Not logged in */
                  <>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Earn your {name} certificate</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Pass the exam and get a verifiable digital certificate with a unique ID.
                    </p>

                    <CheckList items={[
                      "Timed exam with real scoring",
                      "Certificate on pass",
                      `All ${langSlugs.length} language exams included`,
                      "Unlimited retakes",
                    ]} />

                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href={`/signup?next=/certifications/${lang}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                      >
                        Create free account
                      </Link>
                      <Link
                        href={`/login?next=/certifications/${lang}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
                      >
                        Log in
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </aside>
        </div>

        {/* ── Other exams ─────────────────────────────────────────────────── */}
        <OtherExamsGrid
          currentLang={lang}
          langSlugs={langSlugs}
          examConfigByLang={examConfigByLang}
          publicStatsByLang={publicStatsByLang}
          statsByLang={statsByLang}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
