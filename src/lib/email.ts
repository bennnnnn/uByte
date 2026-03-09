/**
 * Transactional email via Resend.
 * Degrades gracefully when RESEND_API_KEY is not set (dev / CI).
 *
 * Onboarding drip sequence (triggered by /api/cron/onboarding-drip):
 *   Day 0 (signup)  → sendWelcomeEmail         — immediate, sent from signup route
 *   Day 3           → sendDay3Email             — motivate, suggest first tutorial
 *   Day 7           → sendDay7Email             — one week in, push certifications
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

// ─── Onboarding drip ────────────────────────────────────────────────────────

/** Day 0 — sent immediately after successful signup. */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to uByte, ${firstName}! 🚀 Your coding journey starts now`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hey ${firstName}, welcome aboard! 👋</h2>
          <p style="color:#6b7280">You just joined thousands of developers levelling up their coding skills on uByte. Here's what you can do right now:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>📖 Interactive Tutorials</strong><br>
              <span style="color:#6b7280;font-size:14px">Step-by-step lessons in Go, Python, JavaScript, C++, Java, and Rust — with a live code editor.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>💼 Interview Prep</strong><br>
              <span style="color:#6b7280;font-size:14px">Solve real interview problems from arrays to dynamic programming. Get instant AI hints.</span>
            </td></tr>
            <tr><td style="padding:10px 0">
              <strong>🏅 Certifications</strong><br>
              <span style="color:#6b7280;font-size:14px">Prove your skills with language certifications you can share on LinkedIn.</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}/tutorial/go/getting-started" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Start your first lesson →</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">You're receiving this because you just signed up at uByte.</p>
        </div>
      </div>
    `,
  });
}

/** Day 3 — encourage users who may not have returned yet. */
export async function sendDay3Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${firstName}, ready for your first challenge? 🎯`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hey ${firstName} 👋</h2>
          <p style="color:#6b7280">It's been a few days since you joined uByte. Have you had a chance to write any code yet?</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 12px;font-weight:600">🔥 Try this today — it only takes 5 minutes:</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Pick a language, open the first tutorial step, and run your first piece of code. The feeling of seeing it work is addictive.</p>
            <a href="${BASE_URL}/tutorial" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open tutorials →</a>
          </div>
          <p style="color:#6b7280;font-size:14px">Or jump straight into an interview prep problem:</p>
          <a href="${BASE_URL}/practice" style="color:#4f46e5;font-size:14px">Browse interview questions →</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px">You're receiving this because you signed up at uByte. <a href="${BASE_URL}/profile" style="color:#9ca3af">Manage preferences</a>.</p>
        </div>
      </div>
    `,
  });
}

/** Day 7 — celebrate one week, push certifications and Pro. */
export async function sendDay7Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
    from: FROM,
    to,
    subject: `One week on uByte 🎉 — ready to earn a certification?`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">One week in, ${firstName}! 🎉</h2>
          <p style="color:#6b7280">You've been on uByte for a week. Whether you've been grinding problems or just exploring, you're on the right track.</p>
          <div style="background:#fff;border:2px solid #4f46e5;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 4px;font-weight:700;color:#4f46e5">🏅 Ready to certify?</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Take a language certification and earn a shareable certificate. It's a great addition to your LinkedIn profile or resume.</p>
            <a href="${BASE_URL}/certifications" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Take a certification →</a>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:16px 0">
            <p style="margin:0 0 4px;font-weight:700">⚡ Unlock everything with Pro</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Get full access to all tutorials, unlimited interview problems, and AI-powered hints with a Pro subscription.</p>
            <a href="${BASE_URL}/pricing" style="color:#4f46e5;font-size:14px;font-weight:600">See Pro plans →</a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px">You're receiving this because you signed up at uByte. <a href="${BASE_URL}/profile" style="color:#9ca3af">Manage preferences</a>.</p>
        </div>
      </div>
    `,
  });
}

/** Contact form submission — forwards user message to the support inbox. */
export async function sendContactEmail(opts: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const SUPPORT = process.env.SUPPORT_EMAIL ?? "support@ubyte.dev";
  await resend.emails.send({
    from: FROM,
    to: SUPPORT,
    replyTo: opts.fromEmail,
    subject: `[uByte Contact] ${opts.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#4f46e5">New contact form message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:4px 8px;font-weight:bold;width:100px">From</td><td>${opts.fromName} &lt;${opts.fromEmail}&gt;</td></tr>
          <tr><td style="padding:4px 8px;font-weight:bold">Subject</td><td>${opts.subject}</td></tr>
        </table>
        <div style="background:#f4f4f5;border-radius:8px;padding:16px;white-space:pre-wrap">${opts.message}</div>
        <p style="color:#71717a;font-size:12px;margin-top:16px">
          Reply directly to this email to respond to ${opts.fromName}.
        </p>
      </div>
    `,
  });
}
