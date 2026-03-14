/**
 * POST /api/contact — handles the contact form submission.
 * Rate-limited to 3 messages per IP per hour to prevent spam.
 */
import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { saveContactMessage } from "@/lib/db/contact-messages";
import { verifyCsrf } from "@/lib/csrf";

export const POST = withErrorHandling("POST /api/contact", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(req.headers);
  const { limited } = await checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (limited) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const { name, email, subject, message } = await req.json() as {
    name?: string; email?: string; subject?: string; message?: string;
  };

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (
    typeof name    !== "string" || name.length    > 100 ||
    typeof email   !== "string" || email.length   > 254 ||
    typeof subject !== "string" || subject.length > 200 ||
    typeof message !== "string" || message.length > 5000
  ) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  await Promise.all([
    sendContactEmail({ fromName: name, fromEmail: email, subject, message }),
    saveContactMessage({ name, email, subject, message }),
  ]);
  return NextResponse.json({ ok: true });
});
