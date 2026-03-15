import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import SiteHeader from "@/components/layout/SiteHeader";
import MobileStandaloneHeader from "@/components/layout/MobileStandaloneHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import LazyCookieConsentAndAnalytics from "@/components/LazyCookieConsentAndAnalytics";
import SiteBanner from "@/components/SiteBanner";
// "use client" wrapper that lazy-loads non-critical widgets with ssr:false
import DeferredWidgets from "@/components/layout/DeferredWidgets";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { SITE_KEYWORDS } from "@/lib/seo";
import Script from "next/script";
import { getSiteBanner } from "@/lib/db/site-banner";
import { unstable_cache } from "next/cache";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Explicit viewport export — prevents Next.js from generating a generic viewport meta
// and ensures mobile browsers scale correctly on first load.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "uByte - Interactive Coding Tutorials and Interview Prep",
    template: "%s | uByte",
  },
  description:
    "Interactive coding tutorials in Go, Python, C++, JavaScript, Java, Rust, and C#. Practice interview problems and certification-style exams in your browser.",
  keywords: [
    ...SITE_KEYWORDS,
    "learn Go",
    "learn Python",
    "learn C++",
    "learn JavaScript",
    "learn Java",
    "learn Rust",
    "coding certification exams",
    "leetcode style practice",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    locale: "en_US",
    title: "uByte - Interactive Coding Tutorials and Interview Prep",
    description:
      "Learn Go, Python, C++, JavaScript, Java, Rust, and C# with interactive tutorials, interview prep, and certification-style exams.",
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/api/og`, width: 1200, height: 630, alt: "uByte — Interactive Coding Tutorials & Certifications" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte - Interactive Coding Tutorials and Interview Prep",
    description:
      "Interactive programming tutorials, interview prep, and certification exams across 7 languages.",
    images: [`${BASE_URL}/api/og`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "uByte",
    statusBarStyle: "default",
  },
};

// Cache the banner for 60 s across all requests so every page load doesn't
// hit the DB — same TTL as the /api/banner Cache-Control header.
const getCachedBanner = unstable_cache(getSiteBanner, ["site-banner"], { revalidate: 60 });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch server-side so the banner is in the initial SSR HTML.
  // If disabled or errored, returns { enabled: false, ... } which SiteBanner ignores.
  const bannerData = await getCachedBanner();

  return (
    <html lang="en" suppressHydrationWarning>
      {/* beforeInteractive places this in <head>, running before any JS hydration.
          Prevents FOUC for dark mode and does NOT block <body> rendering the way
          a raw <script> tag inside <body> does. */}
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.add(t==='light'||t==='dark'?t:d?'dark':'light')}catch(e){}})()` }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to content — keyboard / screen-reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-indigo-700 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ToastProvider>
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            <SiteBanner initialData={bannerData} />
            <SiteHeader />
            <MobileStandaloneHeader />
            {/* Home / practice: just scrollable content. /tutorial/[lang]: sidebar + content from tutorial layout */}
            <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip bg-surface-page">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <SiteFooter />
          </div>
          <LazyCookieConsentAndAnalytics />
          {/* Non-critical widgets deferred via ssr:false in a "use client" wrapper */}
          <DeferredWidgets />
          </ToastProvider>
        </AuthProvider>
        <Script
          id="sw-register"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`,
          }}
        />
      </body>
    </html>
  );
}
