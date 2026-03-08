import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfile, getCertificatesByUser } from "@/lib/db";
import { getUserExamStats } from "@/lib/db/exam-attempts";
import { getAllTutorials } from "@/lib/tutorials";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ui";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Metadata } from "next";

import { BASE_URL } from "@/lib/constants";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

const LANG_META: Record<string, { icon: string; name: string }> = {
  go:         { icon: "🐹", name: "Go" },
  python:     { icon: "🐍", name: "Python" },
  javascript: { icon: "🟨", name: "JavaScript" },
  java:       { icon: "☕", name: "Java" },
  rust:       { icon: "🦀", name: "Rust" },
  cpp:        { icon: "⚙️", name: "C++" },
};

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getPublicProfile(parseInt(userId, 10));
  if (!profile) return { title: "User not found" };
  const canonical = absoluteUrl(`/u/${userId}`);
  return {
    title: `${profile.name}'s Profile | uByte`,
    description: `${profile.name} has ${profile.xp} XP and completed ${profile.completed_count} tutorials on uByte.`,
    alternates: { canonical },
    openGraph: {
      title: `${profile.name} on uByte`,
      description: `${profile.name}'s public learning profile on uByte.`,
      url: canonical,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const id = parseInt(userId, 10);
  if (isNaN(id)) notFound();

  const [profile, certificates, examStats] = await Promise.all([
    getPublicProfile(id),
    getCertificatesByUser(id),
    getUserExamStats(id),
  ]);

  if (!profile) notFound();

  const allLangs = Object.keys(LANGUAGES) as SupportedLanguage[];
  const tutorialCountByLang: Record<string, number> = {};
  let totalTutorials = 0;
  for (const lang of allLangs) {
    const count = getAllTutorials(lang).length;
    tutorialCountByLang[lang] = count;
    totalTutorials += count;
  }

  const pct = totalTutorials > 0 ? Math.round((profile.completed_count / totalTutorials) * 100) : 0;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const statsMap = new Map(examStats.map((s) => [s.lang, s]));

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, breadcrumbJsonLd]),
        }}
      />

      {/* Header */}
      <div className="mb-8 flex items-start gap-5">
        <Avatar avatarKey={profile.avatar || "gopher"} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
          )}
          <p className="mt-2 text-xs text-zinc-400">Joined {joinDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "XP", value: profile.xp.toLocaleString(), icon: "⭐" },
          { label: "Streak", value: `${profile.streak_days}d`, icon: "🔥", sub: `Best: ${profile.longest_streak}d` },
          { label: "Tutorials", value: `${profile.completed_count}/${totalTutorials}`, icon: "📖" },
          { label: "Certificates", value: String(certificates.length), icon: "🏆" },
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

      {/* Tutorial progress */}
      <Card className="mb-8 p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Tutorial progress</span>
          <span className="font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {profile.completed_count} of {totalTutorials} tutorials completed across {allLangs.length} languages
        </p>
      </Card>

      {/* Certifications */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Certifications</h2>
        {certificates.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {certificates.map((cert) => {
              const meta = LANG_META[cert.lang] ?? { icon: "📄", name: cert.lang };
              const stat = statsMap.get(cert.lang);
              return (
                <Card key={cert.id} className="flex items-center gap-4 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl dark:bg-emerald-950/40">
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {meta.name} Certification
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {stat?.bestScore != null ? `Score: ${stat.bestScore}%` : "Passed"}
                      {cert.passed_at ? ` · ${new Date(cert.passed_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/certifications/certificate/${cert.id}`}
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    View
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No certifications earned yet.</p>
          </Card>
        )}
      </section>

      {/* Exam activity (attempted but not certified) */}
      {examStats.filter((s) => !s.hasCertificate && s.attemptCount > 0).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Exam activity</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {examStats
              .filter((s) => !s.hasCertificate && s.attemptCount > 0)
              .map((stat) => {
                const meta = LANG_META[stat.lang] ?? { icon: "📄", name: stat.lang };
                return (
                  <Card key={stat.lang} className="flex items-center gap-4 p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl dark:bg-amber-950/40">
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {meta.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {stat.attemptCount} attempt{stat.attemptCount > 1 ? "s" : ""}
                        {stat.bestScore != null ? ` · Best: ${stat.bestScore}%` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      In progress
                    </span>
                  </Card>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
