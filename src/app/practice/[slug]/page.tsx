import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { PracticeProblemView } from "./PracticeProblemView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) return { title: "Not found" };
  return {
    title: `${problem.title} | Interview Practice`,
    description: problem.description.slice(0, 160),
  };
}

export async function generateStaticParams() {
  const { getAllPracticeProblems } = await import("@/lib/practice/problems");
  return getAllPracticeProblems().map((p) => ({ slug: p.slug }));
}

export default async function PracticeProblemPage({ params }: Props) {
  const { slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) notFound();

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <PracticeProblemView problem={problem} />
      </div>
    </div>
  );
}
