import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/db";
import { getAllTutorials } from "@/lib/tutorials";
import Avatar from "@/components/Avatar";
import type { Metadata } from "next";

import { BASE_URL } from "@/lib/constants";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getPublicProfile(parseInt(userId, 10));
  if (!profile) return { title: "User not found" };
  const canonical = absoluteUrl(`/u/${userId}`);
  return {
    title: `${profile.name}'s Profile`,
    description: `${profile.name} has ${profile.xp} XP and completed ${profile.completed_count} Go tutorials on uByte.`,
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

  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const totalTutorials = getAllTutorials().length;
  const pct = totalTutorials > 0 ? Math.round((profile.completed_count / totalTutorials) * 100) : 0;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, breadcrumbJsonLd]),
        }}
      />
      {/* Header */}
      <div className="mb-8 flex items-start gap-5">
        <Avatar avatarKey={profile.avatar || "gopher"} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
          )}
          <p className="mt-2 text-xs text-zinc-400">Joined {joinDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "XP", value: profile.xp.toLocaleString(), icon: "⭐" },
          { label: "Streak", value: `${profile.streak_days}d`, icon: "🔥", sub: `Best: ${profile.longest_streak}d` },
          { label: "Completed", value: `${profile.completed_count}/${totalTutorials}`, icon: "✅" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
            {s.sub && <p className="text-xs text-zinc-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Tutorial Progress</span>
          <span className="font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {profile.completed_count} of {totalTutorials} tutorials completed
        </p>
      </div>
    </div>
  );
}
