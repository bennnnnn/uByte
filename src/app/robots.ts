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
          "/settings",
          "/dashboard",
          "/login",
          "/signup",
          "/reset-password",
          "/verify-email",
          "/onboarding",
          "/certifications/*/start",
          "/certifications/*/attempt",
          "/certifications/*/result",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
