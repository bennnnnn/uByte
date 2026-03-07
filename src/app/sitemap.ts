import type { MetadataRoute } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllLanguageSlugs } from "@/lib/languages/registry";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl, tutorialLangUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const abs = (path: string) => `${baseUrl}${path === "/" ? "" : path}`;
  const languageSlugs = getAllLanguageSlugs();
  const practiceProblems = getAllPracticeProblems();

  const entries: MetadataRoute.Sitemap = [
    {
      url: abs("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: abs("/practice"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: abs("/practice-exams"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: abs("/pricing"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: abs("/leaderboard"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: abs("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: abs("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: abs("/help"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: abs("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: abs("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
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
      url: abs(`/practice-exams/${lang}`),
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
