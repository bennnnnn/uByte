import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getAllTutorials } from "@/lib/tutorials";
import { isSupportedLanguage } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

export default async function TutorialLangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) notFound();

  const tutorials = getAllTutorials(lang as SupportedLanguage);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <Sidebar lang={lang} tutorials={tutorials} />
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <MobileNav lang={lang} tutorials={tutorials} />
        <div className="flex-1 overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
