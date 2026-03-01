import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Go Playground API + Vercel Analytics
      "connect-src 'self' https://go.dev https://*.sentry.io https://va.vercel-scripts.com vitals.vercel-insights.com",
      // Google OAuth redirect
      "form-action 'self' https://accounts.google.com",
      "img-src 'self' data: https:",
      "frame-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@sentry/nextjs", "canvas-confetti"],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // polyfill-module.js contains inline polyfills for Array.at, Object.hasOwn, etc.
        // All are natively supported by our target browsers (Chrome 93+, Safari 15.4+, Firefox 92+).
        // Aliasing to false resolves to an empty webpack module, eliminating ~13 KiB.
        [path.resolve("node_modules/next/dist/build/polyfills/polyfill-module.js")]: false,
      };
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/tutorials/:slug",
        destination: "/golang/:slug",
        permanent: true,
      },
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
