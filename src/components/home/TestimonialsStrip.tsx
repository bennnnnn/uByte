const TESTIMONIALS = [
  {
    quote:
      "I landed my first developer job after spending three months with uByte. The Go certification was the first thing I mentioned in my interview — the interviewer had actually heard of it.",
    name: "Marcus T.",
    role: "Junior Go Developer",
    avatar: "MT",
    color: "bg-indigo-500",
  },
  {
    quote:
      "Every other platform felt like reading a textbook. Here I was writing real code in the first five minutes. The AI hints are scary good — it feels like having a senior dev next to you.",
    name: "Priya S.",
    role: "Software Engineer",
    avatar: "PS",
    color: "bg-emerald-500",
  },
  {
    quote:
      "Finished the JavaScript track during my commute over four weeks. The interview prep problems hit exactly what I was asked at my Google screen. I'm not exaggerating.",
    name: "David L.",
    role: "Frontend Engineer",
    avatar: "DL",
    color: "bg-violet-500",
  },
  {
    quote:
      "I've tried Codecademy, freeCodeCamp, and LeetCode. uByte is the only one where I actually finished a track instead of quitting after lesson three. The progression just makes sense.",
    name: "Aiko N.",
    role: "Self-taught Developer",
    avatar: "AN",
    color: "bg-rose-500",
  },
];

export default function TestimonialsStrip() {
  return (
    <section aria-label="What developers are saying">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          Trusted by developers worldwide
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Developers who levelled up with uByte
        </h2>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map(({ quote, name, role, avatar, color }) => (
          <figure
            key={name}
            className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="mb-4 text-lg text-amber-400" aria-label="5 out of 5 stars">
              ★★★★★
            </span>

            <blockquote className="flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>&ldquo;{quote}&rdquo;</p>
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}
                aria-hidden="true"
              >
                {avatar}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
