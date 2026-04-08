/**
 * /a/[slug] — personal admin entry point.
 *
 * Each admin can set a private slug (e.g. "john-dev") so they can bookmark
 * /a/john-dev instead of the default /admin URL.
 *
 * Security model:
 *   1. Edge middleware already verified the visitor holds a valid JWT with isAdmin=true.
 *   2. This server component additionally checks that the slug belongs to THEM.
 *   3. If either check fails the visitor is sent to the home page.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminBySlug } from "@/lib/db/admin";
import AdminPage from "@/app/admin/page";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CustomAdminPage({ params }: Props) {
  const { slug } = await params;

  // Verify a valid admin user holds this slug
  const slugOwner = await getAdminBySlug(slug);
  if (!slugOwner) {
    redirect("/");
  }

  // Verify the currently logged-in user IS that admin (slug can't be used by
  // a different admin to impersonate another admin's URL).
  const me = await getCurrentUser();
  if (!me || !me.isAdmin || me.userId !== slugOwner.id) {
    redirect("/");
  }

  // Render the full admin dashboard at this URL
  return <AdminPage />;
}
