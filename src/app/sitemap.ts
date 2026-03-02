import type { MetadataRoute } from "next";
import { getAllTutorials } from "@/lib/tutorials";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const goTutorials = getAllTutorials("go");

  const tutorialEntries = goTutorials.map((tutorial) => ({
    url: `${BASE_URL}${tutorialUrl("go", tutorial.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tutorialEntries,
  ];
}
