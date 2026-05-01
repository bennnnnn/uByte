"use client";

import type { StepProgressState } from "@/hooks/useStepProgress";

interface Props {
  progress: StepProgressState;
  expectedOutput: string[];
  height: number;
}

/** Output panel for the tutorial IDE — shows run output and validation state. */
export default function OutputPanel({
  progress,
  expectedOutput,
  height,
}: Props) {
  const { output, outputIsError, failureKind, status } = progress;

  const labelColor =
    outputIsError || failureKind === "compile"
      ? "text-red-500 "
      : status === "failed" && failureKind === "task"
      ? "text-amber-500 "
      : status === "failed"
      ? "text-red-500 "
      : status === "passed"
      ? "text-emerald-500 "
      : "text-zinc-400 ";

  const outputLabel =
    outputIsError || failureKind === "compile"
      ? "Error"
      : status === "failed" && failureKind === "task"
      ? "Task not complete"
      : status === "failed" && output !== null
      ? "Wrong output"
      : status === "passed"
      ? "Output — correct ✓"
      : "Output";

  const outputColor =
    outputIsError || failureKind === "compile"
      ? "text-red-600 "
      : status === "failed" && failureKind === "task"
      ? "text-amber-700 "
      : status === "failed"
      ? "text-red-600 "
      : "text-emerald-600 ";

  return (
    <div
      className="shrink-0 overflow-y-auto overflow-x-hidden bg-zinc-50 p-4 font-mono text-sm "
      style={{ height }}
      suppressHydrationWarning
    >
      {/* Status label */}
      <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
        {outputLabel}
      </p>

      {/* Output text */}
      {output === null ? null : (
        <pre
          className={`whitespace-pre-wrap break-words text-xs ${outputColor}`}
        >
          {output}
        </pre>
      )}
      {/* Expected output hint */}
      {status === "failed" && output !== null && failureKind === "output" && expectedOutput.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 ">
            Expected Output
          </p>
          <pre className="whitespace-pre-wrap break-words text-xs text-zinc-500 ">
            {expectedOutput.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
