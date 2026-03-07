import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/profile",
          "/login",
          "/reset-password",
          "/verify-email",
          "/search",
          "/practice-exams/*/start",
          "/practice-exams/*/attempt",
          "/practice-exams/*/result",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
