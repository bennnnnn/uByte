export default function GripDots({ vertical }: { vertical?: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${vertical ? "flex-col gap-0.5" : "gap-0.5"}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      ))}
    </div>
  );
}
