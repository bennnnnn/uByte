/**
 * GET  /api/admin/messages — list all contact messages
 * PATCH /api/admin/messages — mark one or all messages read / delete one
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getContactMessages,
  markContactMessageRead,
  markAllContactMessagesRead,
  deleteContactMessage,
} from "@/lib/db/contact-messages";
import { requireAdmin, withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/admin/messages", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const messages = await getContactMessages();
  return NextResponse.json({ messages });
});

export const PATCH = withErrorHandling("PATCH /api/admin/messages", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const body = await req.json() as {
    action: "mark_read" | "mark_all_read" | "delete";
    id?: number;
  };

  if (body.action === "mark_all_read") {
    await markAllContactMessagesRead();
    return NextResponse.json({ ok: true });
  }

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (body.action === "mark_read") {
    await markContactMessageRead(body.id);
  } else if (body.action === "delete") {
    await deleteContactMessage(body.id);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
});
