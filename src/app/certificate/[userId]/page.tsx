import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/constants";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

interface CertData {
  userId: number;
  name: string;
  completedCount: number;
  totalTutorials: number;
  isComplete: boolean;
  issuedAt: string | null;
}

async function getCertData(userId: string): Promise<CertData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/certificate/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const data = await getCertData(userId);
  if (!data?.isComplete) {
    return {
      title: "Certificate",
      robots: { index: false, follow: false },
    };
  }
  const canonical = absoluteUrl(`/certificate/${userId}`);
  return {
    title: `${data.name} — Go Tutorials Certificate`,
    description: `${data.name} has completed all ${data.totalTutorials} Go Tutorials.`,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title: `${data.name} — Go Tutorials Certificate`,
      description: `${data.name} has completed all ${data.totalTutorials} Go Tutorials.`,
      url: canonical,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CertificatePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const data = await getCertData(userId);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-zinc-500">User not found.</p>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">Back to tutorials</Link>
        </div>
      </div>
    );
  }

  if (!data.isComplete) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Certificate not yet earned
          </p>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {data.name} has completed {data.completedCount} of {data.totalTutorials} tutorials.
          </p>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${(data.completedCount / data.totalTutorials) * 100}%` }}
            />
          </div>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">Start learning</Link>
        </div>
      </div>
    );
  }

  const credentialJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "certificate",
    name: `${data.name} - Go Tutorials Certificate`,
    description: `${data.name} completed ${data.totalTutorials} Go tutorials on uByte.`,
    url: absoluteUrl(`/certificate/${userId}`),
    recognizedBy: {
      "@type": "Organization",
      name: "uByte",
      url: BASE_URL,
    },
    validFrom: data.issuedAt ?? undefined,
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Certificate", path: `/certificate/${userId}` },
  ]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([credentialJsonLd, breadcrumbJsonLd]),
        }}
      />
      <div className="w-full max-w-2xl">
        {/* Certificate card */}
        <div className="rounded-2xl border-4 border-indigo-500 bg-white p-10 text-center shadow-2xl dark:border-indigo-600 dark:bg-zinc-900">
          {/* Header decoration */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
            <span className="text-3xl">🐹</span>
            <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Certificate of Completion
          </p>

          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">This certifies that</p>

          <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">{data.name}</h1>

          <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">has successfully completed all</p>

          <p className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {data.totalTutorials} Go Tutorials
          </p>

          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            demonstrating proficiency in the Go programming language
          </p>

          {/* Footer decoration */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
            <p className="text-xs text-zinc-400">
              Issued {data.issuedAt ? formatDate(data.issuedAt) : ""}
            </p>
            <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
          </div>
        </div>

        {/* Share hint */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          Share this page to show off your achievement.{" "}
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">
            Back to tutorials
          </Link>
        </p>
      </div>
    </div>
  );
}
