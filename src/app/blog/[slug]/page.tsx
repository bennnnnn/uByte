import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import { BASE_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const ogTitle = encodeURIComponent(post.title);
  const ogDesc = encodeURIComponent(post.description);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: absoluteUrl(`/blog/${slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${slug}`),
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: `${BASE_URL}/api/og?title=${ogTitle}&description=${ogDesc}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${BASE_URL}/api/og?title=${ogTitle}&description=${ogDesc}`],
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rehypePrettyCodeOptions: any = {
  theme: { dark: "github-dark", light: "github-light" },
  keepBackground: false,
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
      },
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "uByte" },
    publisher: {
      "@type": "Organization",
      name: "uByte",
      url: BASE_URL,
    },
    url: absoluteUrl(`/blog/${slug}`),
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-full overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {post.category}
            </span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* MDX body — styled with Tailwind Typography */}
        <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-indigo-400 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-zinc-800 prose-pre:p-0 prose-pre:bg-transparent">
          {content}
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-7 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Practice what you just read
          </h2>
          <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            uByte has interactive coding tutorials, curated interview problems, and timed certification exams — all in your browser.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Try Interview Prep →
            </Link>
            <Link
              href="/certifications"
              className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-transparent dark:text-indigo-300 dark:hover:bg-indigo-900/30"
            >
              View Certifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
