import type { MetadataRoute } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllLanguageSlugs } from "@/lib/languages/registry";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl, tutorialLangUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const languageSlugs = getAllLanguageSlugs();
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  for (const lang of languageSlugs) {
    const tutorials = getAllTutorials(lang as SupportedLanguage);
    // Language landing page (e.g. /tutorial/go, /tutorial/cpp)
    entries.push({
      url: `${BASE_URL.replace(/\/$/, "")}${tutorialLangUrl(lang)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
    for (const tutorial of tutorials) {
      entries.push({
        url: `${BASE_URL}${tutorialUrl(lang, tutorial.slug)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
