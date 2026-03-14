import type { MetadataRoute } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllLanguageSlugs } from "@/lib/languages/registry";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { getMdxBlogSlugs } from "@/lib/blog";
import { getAllDbBlogPosts } from "@/lib/db/blog-posts";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl, tutorialLangUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const abs = (path: string) => `${baseUrl}${path === "/" ? "" : path}`;
  const languageSlugs = getAllLanguageSlugs();
  const practiceProblems = getAllPracticeProblems();

  const allBlogSlugs = getMdxBlogSlugs();
  const dbPosts = await getAllDbBlogPosts().catch(() => []);
  // DB posts override MDX posts on slug collision — deduplicate
  const dbPublished = dbPosts.filter((p) => p.published);
  const dbSlugsSet = new Set(dbPublished.map((p) => p.slug));
  const blogSlugs = allBlogSlugs.filter((s) => !dbSlugsSet.has(s));
  const entries: MetadataRoute.Sitemap = [
    // Core pages — highest priority
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: abs("/practice"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: abs("/certifications"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: abs("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.90 },
    { url: abs("/interview"), lastModified: now, changeFrequency: "weekly", priority: 0.88 },
    { url: abs("/interviews"), lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: abs("/daily"), lastModified: now, changeFrequency: "daily", priority: 0.82 },
    { url: abs("/leaderboard"), lastModified: now, changeFrequency: "daily", priority: 0.75 },
    // Info pages
    { url: abs("/pricing"), lastModified: now, changeFrequency: "weekly", priority: 0.80 },
    { url: abs("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.60 },
    { url: abs("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.55 },
    { url: abs("/help"), lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: abs("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.30 },
    { url: abs("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.30 },
    // MDX blog posts
    ...blogSlugs.map((slug) => ({
      url: abs(`/blog/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    // DB blog posts — published only (deduped with MDX above)
    ...dbPublished.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.80,
    })),
  ];

  for (const lang of languageSlugs) {
    const tutorials = getAllTutorials(lang as SupportedLanguage);

    entries.push({
      url: abs(tutorialLangUrl(lang)),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    entries.push({
      url: abs(`/practice/${lang}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    });

    entries.push({
      url: abs(`/certifications/${lang}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });

    for (const tutorial of tutorials) {
      entries.push({
        url: abs(tutorialUrl(lang, tutorial.slug)),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    for (const problem of practiceProblems) {
      entries.push({
        url: abs(`/practice/${lang}/${problem.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
  }

  return entries;
}
