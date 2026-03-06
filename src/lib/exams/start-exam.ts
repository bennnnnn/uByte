import type { StartExamResponse, StartExamError } from "./api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";

export type StartExamResult =
  | { kind: "success"; attemptId: string }
  | { kind: "redirect"; url: string }
  | { kind: "error"; message: string };

export async function callStartExamApi(lang: string): Promise<StartExamResult> {
  const res = await fetch(`/api/practice-exams/${lang}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  const data = await parseJson<StartExamResponse & StartExamError>(res);

  if (res.status === 401) return { kind: "redirect", url: "/login" };
  if (res.status === 403 && data?.code === "upgrade_required") {
    return { kind: "redirect", url: "/pricing" };
  }
  if (!res.ok || !data?.attemptId) {
    return { kind: "error", message: getApiErrorMessage(res, data, "Unable to start exam. Please try again.") };
  }
  return { kind: "success", attemptId: data.attemptId };
}
