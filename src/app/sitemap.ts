import type { MetadataRoute } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllLanguageSlugs } from "@/lib/languages/registry";
import { getMdxBlogSlugs } from "@/lib/blog";
import { getAllDbBlogPosts } from "@/lib/db/blog-posts";
import { absoluteUrl } from "@/lib/seo";
import { tutorialUrl, tutorialLangUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

// Cache the sitemap for 24 hours — avoids re-generating (and re-stamping lastModified)
// on every request, which would falsely signal all pages changed constantly.
export const revalidate = 86400;

// Use the deployment's git commit date as a stable lastModified for static/tutorial content.
// VERCEL_GIT_COMMIT_DATE is automatically injected by Vercel on each deployment.
// Falls back to a conservative fixed date for local builds so we never emit live timestamps.
const DEPLOY_DATE = process.env.VERCEL_GIT_COMMIT_DATE
  ? new Date(process.env.VERCEL_GIT_COMMIT_DATE)
  : new Date("2025-01-01T00:00:00.000Z");

function dedupeByUrl(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const e of entries) {
    const prev = byUrl.get(e.url);
    if (!prev) {
      byUrl.set(e.url, e);
      continue;
    }
    const prevT = prev.lastModified ? new Date(prev.lastModified).getTime() : 0;
    const nextT = e.lastModified ? new Date(e.lastModified).getTime() : 0;
    if (nextT >= prevT) byUrl.set(e.url, e);
  }
  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const languageSlugs = getAllLanguageSlugs();

  const allBlogSlugs = getMdxBlogSlugs();
  const dbPosts = await getAllDbBlogPosts().catch(() => []);
  const dbPublished = dbPosts.filter((p) => p.published);
  const dbSlugsSet = new Set(dbPublished.map((p) => p.slug));
  const blogSlugs = allBlogSlugs.filter((s) => !dbSlugsSet.has(s));

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: DEPLOY_DATE, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/tutorial"), lastModified: DEPLOY_DATE, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/blog"), lastModified: DEPLOY_DATE, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/leaderboard"), lastModified: DEPLOY_DATE, changeFrequency: "daily", priority: 0.75 },
    { url: absoluteUrl("/pricing"), lastModified: DEPLOY_DATE, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: DEPLOY_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: DEPLOY_DATE, changeFrequency: "monthly", priority: 0.55 },
    { url: absoluteUrl("/help"), lastModified: DEPLOY_DATE, changeFrequency: "weekly", priority: 0.65 },
    { url: absoluteUrl("/terms"), lastModified: DEPLOY_DATE, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: DEPLOY_DATE, changeFrequency: "yearly", priority: 0.3 },
    ...blogSlugs.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...dbPublished.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated_at ? new Date(p.updated_at) : DEPLOY_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  for (const lang of languageSlugs) {
    const tutorials = getAllTutorials(lang as SupportedLanguage);

    entries.push({
      url: absoluteUrl(tutorialLangUrl(lang)),
      lastModified: DEPLOY_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    for (const tutorial of tutorials) {
      entries.push({
        url: absoluteUrl(tutorialUrl(lang, tutorial.slug)),
        lastModified: DEPLOY_DATE,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return dedupeByUrl(entries);
}
