import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its runtime styles; Sentry needs blob:
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.paddle.com https://sandbox-cdn.paddle.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Go Playground, Vercel Analytics, Google token verification
      "connect-src 'self' https://go.dev https://*.sentry.io https://va.vercel-scripts.com vitals.vercel-insights.com https://paddle.com https://*.paddle.com https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com",
      // Google OAuth redirect + One Tap
      "form-action 'self' https://accounts.google.com",
      "img-src 'self' data: https:",
      "frame-src https://paddle.com https://*.paddle.com https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    // Inline CSS so styles arrive with HTML — removes render-blocking CSS request (~280ms LCP win).
    inlineCss: true,
    optimizeCss: true,
    optimizePackageImports: ["@sentry/nextjs", "canvas-confetti"],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Eliminate Next.js's hardcoded polyfills for Array.at, Object.hasOwn, etc.
        // All are natively supported by Chrome 93+, Safari 15.4+, Firefox 92+.
        // Must use the bare module path (how Next.js registers it), not an absolute path.
        "next/dist/build/polyfills/polyfill-module": false,
      };
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    const tutorialLangs = ["go", "python", "cpp", "javascript", "java", "rust"];
    const langRedirects = tutorialLangs.flatMap((lang) => [
      { source: `/${lang}`, destination: `/tutorial/${lang}`, permanent: true },
      { source: `/${lang}/:path*`, destination: `/tutorial/${lang}/:path*`, permanent: true },
    ]);
    return [
      // Canonicalize domain (avoid www vs non-www auth/cookie mismatches)
      {
        source: "/:path*",
        has: [{ type: "host", value: "ubyte.dev" }],
        destination: "https://www.ubyte.dev/:path*",
        permanent: true,
      },
      { source: "/tutorials/:slug", destination: "/tutorial/go/:slug", permanent: true },
      { source: "/golang/:path*", destination: "/tutorial/go/:path*", permanent: true },
      ...langRedirects,
      // Rebrand: /practice-exams → /certifications
      { source: "/practice-exams", destination: "/certifications", permanent: true },
      { source: "/practice-exams/:path*", destination: "/certifications/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps when SENTRY_AUTH_TOKEN is present (skip in local/CI without it)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  telemetry: false,
});
