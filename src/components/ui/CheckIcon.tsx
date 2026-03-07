export default function CheckIcon({ dim = false }: { dim?: boolean }) {
  return (
    <svg
      className={`h-3 w-3 ${dim ? "text-zinc-400 dark:text-zinc-500" : "text-indigo-600 dark:text-indigo-400"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
