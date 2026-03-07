import Link from "next/link";
import type { LanguageConfig } from "@/lib/languages/types";
import { LANG_ICONS } from "@/lib/languages/icons";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  config: LanguageConfig;
  firstSlug: string | null;
}

export default function TutorialLangHero({ config, firstSlug }: Props) {
  const icon = LANG_ICONS[config.id] ?? "💻";
  return (
    <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-5xl dark:bg-indigo-950">
        {icon}
      </div>
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Learn {config.name}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {config.seo.defaultDescription}
        </p>
        {firstSlug && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={tutorialUrl(config.id, firstSlug)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Start Learning →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
