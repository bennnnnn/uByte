import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getCertificatesByUser } from "@/lib/db";
import { getUserExamStats } from "@/lib/db/exam-attempts";

/** GET /api/profile/exam-certificates — certificates + per-lang exam stats for the current user */
export const GET = withErrorHandling(
  "GET /api/profile/exam-certificates",
  async () => {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const [certs, examStats] = await Promise.all([
      getCertificatesByUser(user.userId),
      getUserExamStats(user.userId),
    ]);
    return NextResponse.json({ certificates: certs, examStats });
  }
);
