import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getCertificateById, getUserById } from "@/lib/db";

/** GET /api/practice-exams/certificate/[certificateId] — details for a single exam certificate (owned by current user). */
export const GET = withErrorHandling(
  "GET /api/practice-exams/certificate/[certificateId]",
  async (_req: Request, context: { params: Promise<{ certificateId: string }> }) => {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const { certificateId } = await context.params;
    const cert = await getCertificateById(certificateId);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (cert.user_id !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const owner = await getUserById(user.userId);

    return NextResponse.json({
      id: cert.id,
      userId: cert.user_id,
      name: owner?.name ?? "Student",
      lang: cert.lang,
      attemptId: cert.attempt_id,
      passedAt: cert.passed_at,
    });
  }
);

