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
          "/billing",
          "/referral",
          "/maintenance",
          "/unsubscribed",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
