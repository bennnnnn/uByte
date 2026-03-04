import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { getAllLanguageSlugs } from "@/lib/languages/registry";

export default function robots(): MetadataRoute.Robots {
  const languageSlugs = getAllLanguageSlugs();
  const allowPaths = ["/", ...languageSlugs.map((slug) => `/tutorial/${slug}/`)];
  return {
    rules: [
      {
        userAgent: "*",
        allow: allowPaths,
        disallow: ["/profile", "/reset-password", "/verify-email", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
