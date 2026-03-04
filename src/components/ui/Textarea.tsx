import { forwardRef } from "react";

const baseClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";

export interface TextareaProps extends Omit<React.ComponentPropsWithoutRef<"textarea">, "className"> {
  error?: boolean;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error, className = "", ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`${baseClass} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : ""} ${className}`}
      {...props}
    />
  );
});

export default Textarea;
