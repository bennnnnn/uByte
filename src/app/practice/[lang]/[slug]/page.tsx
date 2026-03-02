import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPracticeProblemBySlug, getAllPracticeProblems } from "@/lib/practice/problems";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { PracticeIDE } from "./PracticeIDE";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const problem = getPracticeProblemBySlug(slug);
  const langName = isSupportedLanguage(lang) ? LANGUAGES[lang as SupportedLanguage]?.name : lang;
  if (!problem) return { title: "Not found" };
  return {
    title: `${problem.title} (${langName}) | Interview Practice`,
    description: problem.description.slice(0, 160),
  };
}

export async function generateStaticParams() {
  const problems = getAllPracticeProblems();
  const langs: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];
  return langs.flatMap((lang) =>
    problems.map((p) => ({ lang, slug: p.slug }))
  );
}

export default async function PracticeProblemPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isSupportedLanguage(lang)) notFound();
  const problem = getPracticeProblemBySlug(slug);
  if (!problem) notFound();

  return (
    <PracticeIDE
      problem={problem}
      initialLang={lang as SupportedLanguage}
    />
  );
}
