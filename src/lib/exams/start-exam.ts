import type { StartExamResponse, StartExamError } from "./api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";
import { apiFetch } from "@/lib/api-client";

export type StartExamResult =
  | { kind: "success"; attemptId: string }
  | { kind: "redirect"; url: string }
  | { kind: "error"; message: string };

export async function callStartExamApi(lang: string): Promise<StartExamResult> {
  const res = await apiFetch(`/api/certifications/${lang}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await parseJson<StartExamResponse & StartExamError>(res);

  // Certifications are free — only login is required
  if (res.status === 401) return { kind: "redirect", url: `/login?redirect=/certifications/${lang}/start` };
  if (!res.ok || !data?.attemptId) {
    return { kind: "error", message: getApiErrorMessage(res, data, "Unable to start exam. Please try again.") };
  }
  return { kind: "success", attemptId: data.attemptId };
}
