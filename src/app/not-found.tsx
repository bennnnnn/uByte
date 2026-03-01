import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <span className="text-6xl">🐹</span>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Page Not Found
      </h2>
      <p className="text-sm text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-cyan-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-800"
      >
        Back to Home
      </Link>
    </div>
  );
}
