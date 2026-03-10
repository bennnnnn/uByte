/**
 * Shared Judge0 CE helpers and language IDs.
 * Used by /api/run-code and /api/judge-code.
 */

export const JUDGE0_URL = process.env.JUDGE0_URL;

export const JUDGE0_LANG_IDS: Record<string, number> = {
  go: 60,
  python: 71,
  javascript: 63,
  java: 62,
  rust: 73,
  cpp: 54,
  csharp: 51, // C# (Mono 6.6.0.161)
};

export function b64(s: string): string {
  return Buffer.from(s).toString("base64");
}

export function fromb64(s: string | null | undefined): string {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("utf-8");
}

export function maybeDecodeJudge0Message(message: string | null | undefined): string {
  if (!message) return "";
  const m = String(message).trim();
  const looksB64 = /^[A-Za-z0-9+/=\r\n]+$/.test(m) && m.length >= 8;
  if (!looksB64) return m;
  try {
    const decoded = Buffer.from(m.replace(/\s+/g, ""), "base64").toString("utf-8").trim();
    if (!decoded) return m;
    const printable = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
    if (printable.length / decoded.length < 0.85) return m;
    return decoded;
  } catch {
    return m;
  }
}

export type Judge0RawResponse = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status?: { id: number; description: string };
  message?: string | null;
};

/**
 * Normalise a Judge0 response into the shape the run-code frontend expects:
 * { CompileErrors?, Errors?, Events?: { Message, Kind }[] }
 */
export function normaliseJudge0RunOutput(data: Judge0RawResponse): {
  CompileErrors?: string;
  Errors?: string;
  Events?: { Message: string; Kind: string }[];
} {
  if (data.message) {
    return { Errors: maybeDecodeJudge0Message(data.message) };
  }

  const stdout = fromb64(data.stdout).trimEnd();
  const stderr = fromb64(data.stderr).trimEnd();
  const compileOut = fromb64(data.compile_output).trimEnd();
  const statusId = data.status?.id ?? 3;

  if (statusId === 6) {
    return { CompileErrors: compileOut || stderr || "Compilation failed." };
  }
  if (statusId === 5) {
    return { Errors: "Time limit exceeded. Your code ran too long — check for infinite loops." };
  }
  if (statusId >= 7 && statusId <= 12) {
    return { Errors: stderr || `Runtime error (${data.status?.description ?? "unknown"}).` };
  }

  const output = [stdout, stderr].filter(Boolean).join("\n");
  return {
    Events: output ? [{ Message: output, Kind: "stdout" }] : [],
  };
}
