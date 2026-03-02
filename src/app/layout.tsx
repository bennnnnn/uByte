import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AuthButtons from "@/components/AuthButtons";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import ThemeToggle from "@/components/ThemeToggle";
import DeferUntilIdle from "@/components/DeferUntilIdle";
import LazyCookieConsentAndAnalytics from "@/components/LazyCookieConsentAndAnalytics";
import LazyEmailVerificationBanner from "@/components/LazyEmailVerificationBanner";
import LazyFooter from "@/components/LazyFooter";
import { getAllTutorials } from "@/lib/tutorials";
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
  const tutorials = getAllTutorials("go");

  return (
    <html lang="en">
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
            {/* Top header bar — desktop only (mobile uses MobileNav) */}
            <header className="relative z-20 hidden md:flex items-center justify-between border-b border-zinc-100 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
              <Link href="/" className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">U</span>
                <span className="text-lg font-bold">uByte</span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
                <AuthButtons />
              </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
              <Sidebar lang="go" tutorials={tutorials} />
              <div className="flex flex-1 flex-col overflow-hidden">
                <MobileNav lang="go" tutorials={tutorials} />
                <DeferUntilIdle>
                  <LazyEmailVerificationBanner />
                </DeferUntilIdle>
                <main id="main-content" className="flex-1 overflow-y-auto">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>
                <DeferUntilIdle>
                  <LazyFooter />
                </DeferUntilIdle>
              </div>
            </div>
          </div>
          <DeferUntilIdle>
            <LazyCookieConsentAndAnalytics />
          </DeferUntilIdle>
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
