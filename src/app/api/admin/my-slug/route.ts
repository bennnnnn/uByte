/**
 * GET  /api/admin/my-slug  — return current admin's personal slug
 * PUT  /api/admin/my-slug  — set or clear current admin's personal slug
 *
 * The slug becomes the last path segment of the admin's private access URL:
 *   /a/<slug>
 *
 * Slug rules: 3–40 chars, letters / digits / hyphens only, unique across admins.
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getAdminSlug, setAdminSlug, getAdminBySlug } from "@/lib/db/admin";
import { verifyCsrf } from "@/lib/csrf";

const SLUG_RE = /^[a-z0-9-]{3,40}$/;

export const GET = withErrorHandling("GET /api/admin/my-slug", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const slug = await getAdminSlug(admin.id);
  return NextResponse.json({ slug });
});

export const PUT = withErrorHandling("PUT /api/admin/my-slug", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  let body: { slug?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Allow clearing the slug
  if (body.slug === null || body.slug === "") {
    await setAdminSlug(admin.id, null);
    return NextResponse.json({ slug: null });
  }

  const raw = String(body.slug ?? "").trim().toLowerCase();
  if (!SLUG_RE.test(raw)) {
    return NextResponse.json(
      { error: "Slug must be 3–40 characters: lowercase letters, digits, and hyphens only." },
      { status: 400 },
    );
  }

  // Check uniqueness (exclude self)
  const existing = await getAdminBySlug(raw);
  if (existing && existing.id !== admin.id) {
    return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
  }

  await setAdminSlug(admin.id, raw);
  return NextResponse.json({ slug: raw });
});
