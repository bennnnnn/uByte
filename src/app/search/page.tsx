import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search uByte tutorials and lessons.",
  robots: "noindex,follow",
};

export default function SearchPage() {
  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Search
        </h1>
        <Suspense fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading search…</p>}>
          <SearchPageClient />
        </Suspense>
      </div>
    </div>
  );
}
