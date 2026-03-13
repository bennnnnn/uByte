/**
 * GET   /api/admin/interviews — list all experiences (pending first)
 * PATCH /api/admin/interviews — approve / reject / delete
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminExperiences,
  setExperienceApproved,
  deleteExperience,
} from "@/lib/db/interview-experiences";
import { requireAdmin, withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/admin/interviews", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const experiences = await getAdminExperiences();
  return NextResponse.json({ experiences });
});

export const PATCH = withErrorHandling("PATCH /api/admin/interviews", async (req: NextRequest) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const body = await req.json() as {
    action: "approve" | "reject" | "delete";
    id: number;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (body.action === "approve") {
    await setExperienceApproved(body.id, true);
  } else if (body.action === "reject") {
    await setExperienceApproved(body.id, false);
  } else if (body.action === "delete") {
    await deleteExperience(body.id);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
});
