"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eyebrow } from "@/components/ui";

const LEARN_LINKS = [
  { href: "/tutorial/go", label: "Go Tutorials" },
  { href: "/tutorial/python", label: "Python Tutorials" },
  { href: "/tutorial/javascript", label: "JavaScript Tutorials" },
  { href: "/tutorial/java", label: "Java Tutorials" },
  { href: "/tutorial/rust", label: "Rust Tutorials" },
  { href: "/tutorial/cpp", label: "C++ Tutorials" },
];

const PRACTICE_LINKS = [
  { href: "/practice", label: "Interview Prep" },
  { href: "/certifications", label: "Certifications" },
  { href: "/pricing", label: "Pricing" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/help", label: "Help Center" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/llms.txt", label: "llms.txt" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block text-sm leading-6 text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
    >
      {label}
    </Link>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  const isTutorialWorkspace = /^\/tutorial\/[^/]+\/[^/]+/.test(pathname);
  const isPracticeWorkspace = /^\/practice\/[^/]+\/[^/]+/.test(pathname);
  const isExamWorkspace =
    pathname.includes("/attempt/") ||
    pathname.includes("/result/") ||
    pathname.includes("/start");
  const isWorkspaceRoute = isTutorialWorkspace || isPracticeWorkspace || isExamWorkspace;

  if (isWorkspaceRoute) {
    return (
      <footer className="shrink-0 border-t border-zinc-100 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>© {new Date().getFullYear()} uByte</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <FooterLink href="/pricing" label="Pricing" />
            <FooterLink href="/help" label="Help" />
            <FooterLink href="/privacy" label="Privacy" />
            <FooterLink href="/terms" label="Terms" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative shrink-0 overflow-hidden border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-cyan-100/60 blur-3xl dark:bg-cyan-900/20" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-4 pt-10">
        <div className="mb-8 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                U
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">uByte</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Interactive programming tutorials, interview prep, and certification-style exams for modern developers.
            </p>
          </div>

          <div>
            <Eyebrow as="h3" className="mb-3">
              Learn
            </Eyebrow>
            <div className="space-y-2">
              {LEARN_LINKS.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          </div>

          <div>
            <Eyebrow as="h3" className="mb-3">
              Interview Prep
            </Eyebrow>
            <div className="space-y-2">
              {PRACTICE_LINKS.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          </div>

          <div>
            <Eyebrow as="h3" className="mb-3">
              Company
            </Eyebrow>
            <div className="space-y-2">
              {COMPANY_LINKS.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          </div>

          <div>
            <Eyebrow as="h3" className="mb-3">
              Trust
            </Eyebrow>
            <div className="space-y-2">
              {LEGAL_LINKS.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>© {new Date().getFullYear()} uByte. Learn, practice, get certified.</span>
          <span>Based in the cloud. Available worldwide.</span>
        </div>
      </div>
    </footer>
  );
}
