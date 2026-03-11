const TESTIMONIALS = [
  {
    quote: "I passed my Go certification on the first try. The timed exam format is exactly like a real assessment.",
    name: "Amir K.",
    role: "Backend Engineer",
  },
  {
    quote: "Finally a platform to practice Python interview questions without copying solutions. The AI feedback is genuinely useful.",
    name: "Priya S.",
    role: "Software Developer",
  },
  {
    quote: "Added my Rust certificate to LinkedIn within an hour. Three recruiters reached out that same week.",
    name: "James T.",
    role: "Systems Programmer",
  },
];

export default function TestimonialsStrip() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-2">
      <h2 id="testimonials-heading" className="sr-only">
        Developer testimonials
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <blockquote>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{t.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
