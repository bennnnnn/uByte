"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGUAGE_DISPLAY_LIST } from "@/lib/languages/display-list";

/**
 * Set to true when multiple languages have content and you want to show the switcher.
 * Until then, the component is not rendered.
 * To show: render in Sidebar or header, e.g. <LanguageSwitcher currentLang={lang} />
 */
const SHOW_LANGUAGE_SWITCHER = false;

interface LanguageSwitcherProps {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();
  if (!SHOW_LANGUAGE_SWITCHER) return null;

  const basePath = pathname?.replace(/^\/(go|python|cpp)(\/|$)/, "") ?? "";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
      {LANGUAGE_DISPLAY_LIST.map((lang) => {
        const href = basePath ? `/${lang.slug}/${basePath}` : `/${lang.slug}`;
        const isActive = currentLang === lang.slug;
        return (
          <Link
            key={lang.id}
            href={href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {lang.name}
          </Link>
        );
      })}
    </div>
  );
}
