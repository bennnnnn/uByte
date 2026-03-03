import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthButtons from "@/components/AuthButtons";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import HeaderNavLinks from "@/components/layout/HeaderNavLinks";
import MobileStandaloneHeader from "@/components/layout/MobileStandaloneHeader";
import LazyCookieConsentAndAnalytics from "@/components/LazyCookieConsentAndAnalytics";
import { BASE_URL } from "@/lib/constants";
import Link from "next/link";
import Script from "next/script";

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
    default: "uByte — Learn Go for Free",
    template: "%s | uByte",
  },
  description:
    "Learn Go programming for free with uByte — interactive Golang tutorials with real code examples, instant feedback, and exercises. From variables to goroutines.",
  keywords: [
    "Go programming language", "Golang tutorial", "learn Go online", "Go for beginners",
    "free Go course", "interactive Go tutorial", "Go programming course", "Golang for beginners",
    "Go variables", "Go functions", "Go goroutines", "Go channels", "Go syntax",
    "learn Golang free", "Go coding examples", "uByte", "Go web development",
  ],
  authors: [{ name: "uByte" }],
  creator: "uByte",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "uByte",
    locale: "en_US",
    title: "uByte — Learn Go for Free",
    description:
      "Learn Go programming for free with interactive tutorials, real code examples, and instant feedback. Master Golang from scratch.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte — Learn Go for Free",
    description:
      "Learn Go programming for free with interactive tutorials, real code examples, and instant feedback. Master Golang from scratch.",
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
          <div className="flex h-dvh flex-col overflow-hidden">
            {/* Top header — Pricing, Search, Login/Sign up; same on all pages */}
            <header className="relative z-20 hidden md:flex items-center justify-between border-b border-zinc-100 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
              {/* Left: logo + Tutorials + Practice */}
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">U</span>
                  <span className="text-lg font-bold">uByte</span>
                </Link>
                <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
                <HeaderNavLinks side="left" />
              </div>
              {/* Right: Leaderboard + Pricing + auth */}
              <div className="flex items-center gap-2">
                <HeaderNavLinks />
                <AuthButtons />
              </div>
            </header>
            <MobileStandaloneHeader />
            {/* Home / practice: just scrollable content. /[lang]: sidebar + content from [lang] layout */}
            <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <footer className="border-t border-zinc-100 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950 shrink-0">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span>© {new Date().getFullYear()} uByte</span>
                <Link href="/privacy" className="transition-colors hover:text-indigo-600">Privacy</Link>
                <Link href="/terms" className="transition-colors hover:text-indigo-600">Terms</Link>
                <Link href="/leaderboard" className="transition-colors hover:text-indigo-600">Leaderboard</Link>
                <Link href="/pricing" className="transition-colors hover:text-indigo-600">Pricing</Link>
                <a href="https://go.dev" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-indigo-600">go.dev</a>
              </div>
            </footer>
          </div>
          <LazyCookieConsentAndAnalytics />
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
