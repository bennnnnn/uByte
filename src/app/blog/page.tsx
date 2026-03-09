import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Programming tutorials, interview prep guides, and language deep-dives from the uByte team. Go, Python, Rust, JavaScript, Java, and C++.",
  keywords: [
    ...SITE_KEYWORDS,
    "programming blog",
    "coding tutorials",
    "developer guides",
    "go tutorial",
    "rust tutorial",
    "python tutorial",
  ],
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    type: "website",
    title: "uByte Blog — Programming Tutorials & Guides",
    description:
      "In-depth programming tutorials, interview prep guides, and language comparisons from the uByte team.",
    url: absoluteUrl("/blog"),
    images: [{ url: `${BASE_URL}/api/og?title=Blog&description=Programming+tutorials+%26+guides`, width: 1200, height: 630 }],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Interview Prep": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "Learning Guide": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Language Deep Dive": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Comparison": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function categoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">

        <section className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Blog
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Tutorials & Guides
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            In-depth programming tutorials, interview prep guides, and language deep-dives — with real code you can run in your browser.
          </p>
        </section>

        {posts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-zinc-200 bg-surface-card p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-indigo-700"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
