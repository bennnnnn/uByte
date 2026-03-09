import type { Metadata } from "next";
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
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { SITE_KEYWORDS } from "@/lib/seo";
import Script from "next/script";
import { Suspense } from "react";
import ReferralTracker from "@/components/ReferralTracker";
import OnboardingChecklist from "@/components/OnboardingChecklist";

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "uByte - Interactive Coding Tutorials and Interview Prep",
    template: "%s | uByte",
  },
  description:
    "Interactive coding tutorials in Go, Python, C++, JavaScript, Java, and Rust. Practice interview problems and certification-style exams in your browser.",
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
      "Learn Go, Python, C++, JavaScript, Java, and Rust with interactive tutorials, interview prep, and certification-style exams.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte - Interactive Coding Tutorials and Interview Prep",
    description:
      "Interactive programming tutorials, interview prep, and certification exams across 6 languages.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Blocking inline script — runs before first paint to apply saved theme class.
            Prevents the flash of light theme on refresh when dark mode is preferred. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.add(t==='light'||t==='dark'?t:d?'dark':'light')}catch(e){}})()` }} />
        {/* Skip to content — keyboard / screen-reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-700 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ToastProvider>
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            <SiteBanner />
            <SiteHeader />
            <MobileStandaloneHeader />
            {/* Home / practice: just scrollable content. /tutorial/[lang]: sidebar + content from tutorial layout */}
            <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip bg-surface-page">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <SiteFooter />
          </div>
          <LazyCookieConsentAndAnalytics />
          {/* Reads ?ref= from URL and persists to localStorage for signup attribution */}
          <Suspense fallback={null}><ReferralTracker /></Suspense>
          {/* Floating checklist for new users — hides once all 3 steps are done */}
          <OnboardingChecklist />
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
