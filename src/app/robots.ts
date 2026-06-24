import type { MetadataRoute } from "next";
import { absoluteUrl, siteHost } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/a/",
          "/admin",
          "/profile",
          "/settings",
          "/dashboard",
          "/notifications",
          "/login",
          "/signup",
          "/reset-password",
          "/verify-email",
          "/onboarding",
          "/maintenance",
          "/unsubscribed",
          "/u/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteHost(),
  };
}
