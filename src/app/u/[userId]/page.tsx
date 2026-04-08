import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/db";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { getCompletedStepCountByLanguage } from "@/lib/db/step-progress";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ui";
import ShareProfileButton from "./ShareProfileButton";
import { LANGUAGES } from "@/lib/languages/registry";
import { LANG_ICONS } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Metadata } from "next";

import { APP_NAME, BASE_URL } from "@/lib/constants";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getPublicProfile(parseInt(userId, 10));
  if (!profile) return { title: "User not found" };
  const canonical = absoluteUrl(`/u/${userId}`);
  const title = `${profile.name}'s Learning Profile | uByte`;
  const description = `${profile.name} has earned ${profile.xp} XP on uByte by working through interactive coding tutorials and lessons.`;
  const ogImage = absoluteUrl(`/api/og?title=${encodeURIComponent(profile.name)}&description=${encodeURIComponent(`${profile.xp} XP · uByte learner`)}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "profile",
      siteName: APP_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const id = parseInt(userId, 10);
  if (isNaN(id)) notFound();

  const profile = await getPublicProfile(id);

  if (!profile) notFound();

  const allLangs = Object.keys(LANGUAGES) as SupportedLanguage[];

  // Use step_progress counts (individual steps) not the progress table (chapter completions).
  // This matches the profile tab and tutorial cards — partial chapters count too.
  const stepCountMap = await getCompletedStepCountByLanguage(id);

  let totalLessons = 0;
  let completedLessons = 0;
  for (const lang of allLangs) {
    totalLessons += getTotalLessonCount(lang);
    completedLessons += stepCountMap.get(lang) ?? 0;
  }

  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const startedLanguages = allLangs
    .map((lang) => {
      const steps = stepCountMap.get(lang) ?? 0;
      return {
        lang,
        steps,
        lessons: getTotalLessonCount(lang),
        name: LANGUAGES[lang]?.name ?? lang,
        icon: LANG_ICONS[lang] ?? "📘",
      };
    })
    .filter((entry) => entry.steps > 0)
    .sort((a, b) => b.steps - a.steps);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    description: profile.bio || `${profile.name}'s uByte coding profile`,
    url: absoluteUrl(`/u/${userId}`),
    memberOf: {
      "@type": "Organization",
      name: "uByte",
      url: BASE_URL,
    },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: profile.name, path: `/u/${userId}` },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, breadcrumbJsonLd]).replace(/</g, "\\u003c"),
        }}
      />

      {/* Header */}
      <div className="mb-8 flex items-start gap-5">
        <Avatar avatarKey={profile.avatar || "gopher"} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h1>
              {profile.bio && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
              )}
              <p className="mt-2 text-xs text-zinc-400">Joined {joinDate}</p>
            </div>
            <ShareProfileButton url={absoluteUrl(`/u/${userId}`)} name={profile.name} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "XP", value: profile.xp.toLocaleString(), icon: "⭐" },
            { label: "Streak", value: `${profile.streak_days}d`, icon: "🔥", sub: `Best: ${profile.longest_streak}d` },
            { label: "Lessons", value: `${completedLessons}/${totalLessons}`, icon: "📖" },
            { label: "Languages", value: String(startedLanguages.length), icon: "🌍" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
            {"sub" in s && s.sub && <p className="text-xs text-zinc-400">{s.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Learning progress */}
      <Card className="mb-8 p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Learning progress</span>
          <span className="font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {completedLessons} of {totalLessons} lessons completed across {allLangs.length} languages
        </p>
      </Card>

      {/* Learning by language */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Learning by language</h2>
        {startedLanguages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {startedLanguages.map((entry) => {
              const completion = Math.round((entry.steps / Math.max(entry.lessons, 1)) * 100);
              return (
                <Card key={entry.lang} className="flex items-center gap-4 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl dark:bg-emerald-950/40">
                    {entry.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.steps} of {entry.lessons} lessons completed · {completion}%
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No public lesson progress yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
