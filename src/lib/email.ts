/**
 * Transactional email via Resend.
 * Degrades gracefully when RESEND_API_KEY is not set (dev / CI).
 */
import { Resend } from "resend";

import { BASE_URL } from "@/lib/constants";
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendStreakReminderEmail(
  to: string,
  name: string,
  streakDays: number
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const siteUrl = BASE_URL;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 Keep your ${streakDays}-day streak alive — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0891b2">Your streak is at risk!</h2>
        <p>Hi ${name},</p>
        <p>You have a <strong>${streakDays}-day</strong> streak on uByte — don't let it slip today!</p>
        <a href="${siteUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Keep my streak 🔥</a>
        <p style="color:#6b7280;font-size:13px">Complete any tutorial step to keep your streak going.</p>
        <p style="color:#6b7280;font-size:12px">You're receiving this because you have an active streak on uByte. <a href="${siteUrl}/profile" style="color:#6b7280">Manage your preferences</a>.</p>
      </div>
    `,
  });
}

export async function sendGoogleLinkedEmail(
  to: string,
  name: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const siteUrl = BASE_URL;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Google sign-in linked to your uByte account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0891b2">Google sign-in linked</h2>
        <p>Hi ${name},</p>
        <p>Google sign-in has been linked to your uByte account. You can now sign in with either your password or Google.</p>
        <p style="color:#dc2626;font-weight:600">If you didn't do this, your account may be compromised. Change your password immediately.</p>
        <a href="${siteUrl}/profile" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Secure my account</a>
        <p style="color:#6b7280;font-size:12px">You're receiving this because a Google account was linked to your uByte account.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] verify-email token for ${to}: ${token}`);
    }
    return;
  }

  const link = `${BASE_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email — uByte",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0891b2">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to verify your email address.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify email</a>
        <p style="color:#6b7280;font-size:13px">If you didn't sign up for uByte, you can safely ignore this email.</p>
        <p style="color:#6b7280;font-size:12px">Or copy this link: ${link}</p>
      </div>
    `,
  });
}
