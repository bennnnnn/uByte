import { NextRequest, NextResponse } from "next/server";
import {
  getAdminUsers,
  adminResetUserProgress,
  adminDeleteUser,
  adminBanUser,
  adminUnbanUser,
  setAdminStatus,
  getAdminTutorialAnalytics,
  logAdminAction,
  getStepCheckStats,
  updateUserPlan,
  getPracticeProblemStats,
} from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAdmin, requireSuperAdmin } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/admin/users", async (request: NextRequest) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("view") === "analytics") {
    const analytics = await getAdminTutorialAnalytics();
    return NextResponse.json({ analytics });
  }
  if (searchParams.get("view") === "step-stats") {
    const slug = searchParams.get("slug") ?? "";
    if (!slug) return NextResponse.json({ stats: [] });
    const stats = await getStepCheckStats(slug);
    return NextResponse.json({ stats });
  }
  if (searchParams.get("view") === "practice-stats") {
    const stats = await getPracticeProblemStats();
    return NextResponse.json({ stats });
  }
  if (searchParams.get("export") === "csv") {
    const users = await getAdminUsers();
    const header = "id,name,email,xp,streak_days,created_at,last_active_at,is_admin,banned,completed_count,bookmark_count,plan";
    const escape = (v: string | number | boolean | null | undefined) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = users.map((u) =>
      [u.id, u.name, u.email, u.xp, u.streak_days, u.created_at, u.last_active_at ?? "", u.is_admin, u.banned, u.completed_count, u.bookmark_count, u.plan ?? "free"].map(escape).join(",")
    );
    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="users.csv"',
      },
    });
  }

  const users = await getAdminUsers();
  return NextResponse.json({ users });
});

export const POST = withErrorHandling("POST /api/admin/users", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireSuperAdmin();
  if (!admin) return response;

  const body = (await request.json()) as { action: string; userId: number; plan?: string };
  const { action, userId, plan } = body;

  if (!action || typeof action !== "string") {
    return NextResponse.json({ error: "Action is required" }, { status: 400 });
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  if (userId === admin.id && ["delete_user", "remove_admin"].includes(action)) {
    return NextResponse.json({ error: "Cannot perform this action on yourself" }, { status: 400 });
  }

  if (action === "reset_progress") {
    await adminResetUserProgress(userId);
    await logAdminAction(admin.id, "reset_progress", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "delete_user") {
    await adminDeleteUser(userId);
    await logAdminAction(admin.id, "delete_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "ban_user") {
    await adminBanUser(userId);
    await logAdminAction(admin.id, "ban_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "unban_user") {
    await adminUnbanUser(userId);
    await logAdminAction(admin.id, "unban_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "set_admin") {
    await setAdminStatus(userId, true);
    await logAdminAction(admin.id, "set_admin", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "remove_admin") {
    await setAdminStatus(userId, false);
    await logAdminAction(admin.id, "remove_admin", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "set_plan") {
    const allowed = ["free", "pro", "yearly", "monthly"];
    if (!plan || !allowed.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Use free, pro, yearly, or monthly." }, { status: 400 });
    }
    await updateUserPlan(userId, plan);
    await logAdminAction(admin.id, `set_plan:${plan}`, userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
