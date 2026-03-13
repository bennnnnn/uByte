const TESTIMONIALS = [
  {
    quote: "I passed my Go certification on the first try. The timed exam format is exactly like a real assessment — and the certificate is on my LinkedIn profile the same day.",
    name: "Amir K.",
    role: "Backend Engineer",
    initials: "AK",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    quote: "Finally a platform to practice Python interview questions without just copying solutions. The step-by-step feedback catches my mistakes before bad habits form.",
    name: "Priya S.",
    role: "Software Developer",
    initials: "PS",
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    quote: "Added my Rust certificate to LinkedIn within an hour. Three recruiters reached out that same week. This platform is the real deal.",
    name: "James T.",
    role: "Systems Programmer",
    initials: "JT",
    gradient: "from-cyan-500 to-indigo-600",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsStrip() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-2">
      <div className="mb-10 text-center">
        <h2 id="testimonials-heading" className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Loved by developers
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Real learners. Real results. Real careers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-800/80"
          >
            {/* Large decorative quote mark */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 top-3 select-none text-[5rem] font-black leading-none text-zinc-100 dark:text-zinc-800"
            >
              &ldquo;
            </span>

            {/* Stars */}
            <div className="relative mb-4">
              <StarRating />
            </div>

            <blockquote className="relative flex-1">
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white shadow`}
              >
                {t.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{t.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                Verified ✓
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
