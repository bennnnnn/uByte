import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const securityHeaders = [
  // Prevent the page from being embedded in iframes on other domains (clickjacking).
  // Also enforced via CSP frame-ancestors below (belt-and-suspenders).
  { key: "X-Frame-Options",        value: "DENY" },
  // Prevent browsers from MIME-sniffing a response away from its declared content-type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send full URL as referrer for same-origin requests; only origin for cross-origin.
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  // Disable browser features the app doesn't use.
  // interest-cohort=() opts out of FLoC / Topics API tracking.
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' required by Next.js runtime styles and inline event handlers.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://accounts.google.com",
      // accounts.google.com required for Google One Tap / GSI stylesheet (gsi/style).
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Go Playground, Sentry, Vercel Analytics/Vitals, Paddle API, Google OAuth.
      // Fixed: vitals.vercel-insights.com was missing the https:// scheme.
      "connect-src 'self' https://go.dev https://*.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://paddle.com https://*.paddle.com https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com",
      // Restrict where forms may be submitted (prevents open-redirect via <form action>).
      "form-action 'self' https://accounts.google.com",
      "img-src 'self' data: https:",
      // Paddle checkout overlay + Google One Tap run in iframes.
      "frame-src https://paddle.com https://*.paddle.com https://accounts.google.com",
      // Prevent <base> tag injection (could redirect all relative URLs to an attacker's origin).
      "base-uri 'self'",
      // Code editor (CodeMirror/Monaco) creates web workers from blob URLs for syntax parsing.
      "worker-src 'self' blob:",
      // Block Flash, Java applets, and other legacy plugins — none are used here.
      "object-src 'none'",
      // CSP-level iframe protection (supersedes X-Frame-Options in modern browsers).
      "frame-ancestors 'none'",
    ].join("; "),
  },
  // Allow same-origin popups (required for Google OAuth flow) while still
  // isolating the top-level window from cross-origin documents.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // HSTS: tell browsers to always use HTTPS for this domain for 2 years.
  // Only set in production — setting it locally would permanently break the HTTP dev server.
  // includeSubDomains covers api.ubyte.dev etc; preload allows browser preload-list inclusion.
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // Ensure content/ directory (MDX + .steps.json files) is bundled for every
  // serverless function. Without this, Next.js output-file tracing may omit it
  // for some functions (e.g. home page), causing getTotalLessonCount to fall
  // back to TS step definitions and return a different count than the tutorial page.
  outputFileTracingIncludes: {
    "**/*": ["./content/**/*"],
  },
  experimental: {
    // Inline ALL global CSS into the HTML document.
    // With optimizeCss (critters), only "critical" CSS is inlined and the rest is deferred.
    // Critters renders at mobile width, so lg: breakpoint rules (e.g. the hero section's
    // lg:min-h-[calc(100svh-3.5rem)]) are marked non-critical and loaded async — AFTER
    // the first paint. When that deferred CSS finally applies, the hero expands ~430 px,
    // pushing the footer out of the viewport and producing a CLS of ~0.344.
    // Using inlineCss alone inlines everything with no deferral, eliminating all CSS-driven CLS.
    inlineCss: true,
    optimizePackageImports: ["@sentry/nextjs", "canvas-confetti"],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Next.js loads polyfills via relative imports inside next/dist/client/app-globals.js
      // (e.g. require("../build/polyfills/polyfill-module")).
      // Webpack resolves those to absolute paths, so we must alias the absolute path —
      // a bare package-name alias like "next/dist/build/polyfills/polyfill-module" only
      // matches absolute-path imports and does NOT match the relative ones Next.js uses.
      // Setting the alias value to `false` tells webpack to resolve it to an empty module.
      const polyfillRoot = path.resolve("node_modules/next/dist/build/polyfills");
      config.resolve.alias = {
        ...config.resolve.alias,
        // Absolute-path aliases — match the relative imports inside Next.js internals
        [path.join(polyfillRoot, "polyfill-module")]:  false,
        [path.join(polyfillRoot, "polyfill-nomodule")]: false,
        [path.join(polyfillRoot, "polyfills")]:         false,
        // Package-name aliases — match any direct imports from consuming code
        "next/dist/build/polyfills/polyfill-module":  false,
        "next/dist/build/polyfills/polyfill-nomodule": false,
        "next/dist/build/polyfills/polyfills":         false,
      };
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async redirects() {
    // Keep in sync with src/lib/languages/types.ts SupportedLanguage union.
    // next.config runs before app source is compiled, so we cannot import the registry here.
    const tutorialLangs = ["go", "python", "cpp", "javascript", "java", "rust", "csharp"];
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
