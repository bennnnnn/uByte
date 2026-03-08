import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getCertificateById, getUserById } from "@/lib/db";

/** GET /api/certifications/certificate/[certificateId] — public certificate verification. */
export const GET = withErrorHandling(
  "GET /api/certifications/certificate/[certificateId]",
  async (_req: Request, context?: unknown) => {
    const { certificateId } = (context as { params?: Promise<{ certificateId: string }> }).params
      ? await (context as { params: Promise<{ certificateId: string }> }).params
      : { certificateId: "" };
    const cert = await getCertificateById(certificateId);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const owner = await getUserById(cert.user_id);

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

