import Link from "next/link";

const CATEGORIES = [
  {
    id: "backend",
    icon: "⚙️",
    label: "Backend Development",
    description: "Servers, APIs, databases, and performance",
    languages: [
      { slug: "go",     icon: "🐹", name: "Go"     },
      { slug: "python", icon: "🐍", name: "Python"  },
      { slug: "java",   icon: "☕", name: "Java"    },
      { slug: "rust",   icon: "🦀", name: "Rust"    },
    ],
    color: "border-blue-200/60 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-950/20",
    iconColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    id: "frontend",
    icon: "🎨",
    label: "Frontend & Web",
    description: "Interfaces, interactivity, and modern web",
    languages: [
      { slug: "javascript", icon: "🟨", name: "JavaScript" },
      { slug: "typescript", icon: "🔷", name: "TypeScript" },
    ],
    color: "border-violet-200/60 bg-violet-50/50 dark:border-violet-800/30 dark:bg-violet-950/20",
    iconColor: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
  {
    id: "systems",
    icon: "🖥️",
    label: "Systems & Performance",
    description: "Low-level, speed-critical, embedded systems",
    languages: [
      { slug: "cpp",    icon: "⚙️", name: "C++"  },
      { slug: "rust",   icon: "🦀", name: "Rust" },
      { slug: "csharp", icon: "💜", name: "C#"   },
    ],
    color: "border-amber-200/60 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20",
    iconColor: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  {
    id: "data",
    icon: "📊",
    label: "Data & Analytics",
    description: "Databases, queries, and data manipulation",
    languages: [
      { slug: "sql",    icon: "🗄️", name: "SQL"    },
      { slug: "python", icon: "🐍", name: "Python" },
    ],
    color: "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20",
    iconColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
];

export default function CategoryBrowse() {
  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
          🗂️ Browse by goal
        </p>
        <h2 id="categories-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          What do you want to build?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`rounded-2xl border p-5 ${cat.color}`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${cat.iconColor}`}>
                {cat.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{cat.label}</p>
              </div>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {cat.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.languages.map(lang => (
                <Link
                  key={lang.slug}
                  href={`/tutorial/${lang.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-white hover:text-indigo-600 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <span>{lang.icon}</span>
                  <span>{lang.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
