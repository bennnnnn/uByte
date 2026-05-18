import { apiFetch } from "@/lib/api-client";

export async function runCodeRequest(
  currentCode: string,
  lang: string = "go",
): Promise<{ output: string; hasError: boolean }> {
  const res = await apiFetch("/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: currentCode, language: lang }),
  });
  const data = await res.json();
  if (data.Errors) return { output: data.Errors as string, hasError: true };
  const out = ((data.Events ?? []) as { Kind: string; Message: string }[])
    .filter((e) => e.Kind === "stdout")
    .map((e) => e.Message)
    .join("");
  return { output: out, hasError: false };
}
