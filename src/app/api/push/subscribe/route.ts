/**
 * POST /api/push/subscribe  — save a push subscription for the current user
 * DELETE /api/push/subscribe — remove it (unsubscribe)
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePushSubscription, deletePushSubscription } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

export const POST = withErrorHandling("POST /api/push/subscribe", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await savePushSubscription(user.userId, endpoint, { p256dh: keys.p256dh, auth: keys.auth });
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling("DELETE /api/push/subscribe", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json() as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

  await deletePushSubscription(user.userId, endpoint);
  return NextResponse.json({ ok: true });
});
