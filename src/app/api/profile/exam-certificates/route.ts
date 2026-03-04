import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getCertificatesByUser } from "@/lib/db";

/** GET /api/profile/exam-certificates — list of exam certificates for the current user */
export const GET = withErrorHandling(
  "GET /api/profile/exam-certificates",
  async () => {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const certs = await getCertificatesByUser(user.userId);
    return NextResponse.json({ certificates: certs });
  }
);

