import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed — uByte",
  description: "You've been unsubscribed from uByte marketing emails.",
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          You&apos;re unsubscribed
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          You&apos;ve been removed from uByte marketing and progress emails. You&apos;ll
          still receive essential emails like password resets and security notices.
        </p>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-500">
          Changed your mind? You can re-enable emails from your{" "}
          <Link href="/profile" className="text-indigo-600 underline dark:text-indigo-400">
            profile settings
          </Link>
          .
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Back to uByte
        </Link>
      </div>
    </div>
  );
}
