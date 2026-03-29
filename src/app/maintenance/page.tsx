import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Under Maintenance",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-4xl dark:bg-indigo-950">
          🔧
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Down for maintenance
        </h1>

        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          We&apos;re making some improvements to {APP_NAME}. We&apos;ll be back
          up shortly. Thanks for your patience!
        </p>

        {/* Divider */}
        <div className="my-8 h-px bg-zinc-200 dark:bg-zinc-800" />

        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          If you have an urgent question, reach out at{" "}
          <a
            href="mailto:support@ubyte.dev"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            support@ubyte.dev
          </a>
        </p>
      </div>
    </div>
  );
}
