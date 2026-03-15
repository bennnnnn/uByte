import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";
import CertificateClient from "./CertificateClient";

type Props = { params: Promise<{ certificateId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certificateId } = await params;
  const title = `Programming Certificate — Verified by ${APP_NAME}`;
  const description = `Verify this programming certificate issued by ${APP_NAME}. Certificate ID: ${certificateId}. Earned by passing a timed certification exam.`;
  const canonical = absoluteUrl(`/certifications/certificate/${certificateId}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(`/api/og?title=Programming+Certificate&description=Verified+by+${APP_NAME}`), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CertificatePage() {
  return (
    <>
      <CertificateClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>Programming Certificate — Verified by {APP_NAME}</h1>
        <p>
          This page displays a verified programming certificate issued by {APP_NAME}.
          Certificates are earned by passing timed certification exams in Go,
          Python, JavaScript, Java, C++, Rust, or C#. Each certificate has a
          unique ID and can be shared on LinkedIn or added to a resume.
        </p>

        <section>
          <h2>How Certificates Work</h2>
          <ul>
            <li>Take a timed certification exam in your chosen language</li>
            <li>Answer multiple-choice and coding questions under a time limit</li>
            <li>Score above the passing threshold to earn your certificate</li>
            <li>Share the certificate URL — anyone can verify it here</li>
          </ul>
        </section>

        <nav>
          <ul>
            <li><Link href="/certifications">Browse All Certifications</Link></li>
            <li><Link href="/tutorial/go">Start Learning</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
