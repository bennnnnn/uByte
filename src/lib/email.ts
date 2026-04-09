/**
 * Transactional email via Resend (Node.js SDK).
 * Degrades gracefully when RESEND_API_KEY is not set (dev / CI).
 *
 * Follows Resend’s `{ data, error }` response pattern — the SDK does not throw on API errors.
 * @see https://resend.com/docs
 *
 * Onboarding drip sequence (triggered by /api/cron/onboarding-drip):
 *   Day 0 (signup)  → sendWelcomeEmail         — immediate, sent from signup route
 *   Day 3           → sendDay3Email             — motivate, suggest first tutorial
 *   Day 7           → sendDay7Email             — one week in, reinforce the habit + hint upsell
 */
import { createHash } from "crypto";
import { Resend } from "resend";

import { BASE_URL } from "@/lib/constants";
import { makeUnsubscribeUrl } from "@/lib/unsubscribe";

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];
type EmailRequestOptions = NonNullable<Parameters<Resend["emails"]["send"]>[1]>;

const FROM: string =
  process.env.RESEND_FROM_EMAIL?.trim() || "noreply@ubyte.dev";

/** Escape user-supplied text before embedding in HTML to prevent injection. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Standard unsubscribe footer for all marketing emails. */
function unsubFooter(email: string): string {
  try {
    const url = makeUnsubscribeUrl(email);
    return `<p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px">
    You're receiving this because you have an account on uByte.<br>
    <a href="${url}" style="color:#9ca3af">Unsubscribe from marketing emails</a> ·
    <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>
  </p>`;
  } catch (err) {
    console.error("[email] unsubFooter: missing JWT_SECRET/UNSUBSCRIBE_SECRET — using minimal footer", err);
    return `<p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px">
    <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>
  </p>`;
  }
}

/** Idempotency keys must be ≤256 chars (Resend). */
function idempotencyKey(prefix: string, seed: string): string {
  const combined = `${prefix}/${seed}`;
  if (combined.length <= 256) return combined;
  return `${prefix}/${createHash("sha256").update(seed).digest("hex")}`;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

type SendEmailMeta = {
  /** For logs and Sentry — which high-level send this is */
  context: string;
  /** Safe retries without duplicate sends (expires after 24h on Resend’s side) */
  idempotencyKey?: string;
};

/**
 * Wraps `resend.emails.send`: checks both `data` and `error` per Resend Node SDK docs, then throws
 * so API routes can still use try/catch for operational failures (network issues may still reject).
 */
async function sendEmail(resend: Resend, payload: EmailPayload, meta: SendEmailMeta): Promise<void> {
  const { from: ignoredFrom, ...rest } = payload as EmailPayload & { from?: string };
  void ignoredFrom;
  const requestOptions: EmailRequestOptions | undefined = meta.idempotencyKey
    ? { idempotencyKey: meta.idempotencyKey }
    : undefined;

  const { data, error } = await resend.emails.send({ from: FROM, ...rest } as EmailPayload, requestOptions);

  if (error) {
    const detail = `${error.name}: ${error.message}`;
    console.error(`[email] ${meta.context}:`, detail);
    throw new Error(`Resend send failed: ${detail}`);
  }
  if (process.env.NODE_ENV === "development" && data?.id) {
    console.info(`[email] ${meta.context}: message id ${data.id}`);
  }
}

function logMissingResendApiKey(context: string): void {
  console.error(
    `[email] ${context}: RESEND_API_KEY is missing or blank — set it in Vercel (Production) and redeploy. No email was sent.`
  );
}

export async function sendStreakReminderEmail(
  to: string,
  name: string,
  streakDays: number
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const safeName = escapeHtml(name);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `🔥 Keep your ${streakDays}-day streak alive — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Your streak is at risk!</h2>
        <p>Hi ${safeName},</p>
        <p>You have a <strong>${streakDays}-day</strong> streak on uByte — don't let it slip today!</p>
        <a href="${BASE_URL}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Keep my streak 🔥</a>
        <p style="color:#6b7280;font-size:13px">Complete a tutorial step or continue a lesson today — any learning activity counts.</p>
        ${unsubFooter(to)}
      </div>
    `,
  }, { context: "sendStreakReminderEmail" });
}

export async function sendGoogleLinkedEmail(
  to: string,
  name: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const siteUrl = BASE_URL;
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: "Google sign-in linked to your uByte account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Google sign-in linked</h2>
        <p>Hi ${name},</p>
        <p>Google sign-in has been linked to your uByte account. You can now sign in with either your password or Google.</p>
        <p style="color:#dc2626;font-weight:600">If you didn't do this, your account may be compromised. Change your password immediately.</p>
        <a href="${siteUrl}/settings" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Secure my account</a>
        <p style="color:#6b7280;font-size:12px">You're receiving this because a Google account was linked to your uByte account.</p>
      </div>
    `,
  }, { context: "sendGoogleLinkedEmail" });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logMissingResendApiKey("sendVerificationEmail");
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] verify-email token for ${to}: ${token}`);
    }
    return;
  }

  const safeName = escapeHtml(name);
  const link = `${BASE_URL}/verify-email?token=${token}`;
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: "Verify your email — uByte",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Verify your email</h2>
        <p>Hi ${safeName},</p>
        <p>Click the button below to verify your email address.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify email</a>
        <p style="color:#6b7280;font-size:13px">If you didn't sign up for uByte, you can safely ignore this email.</p>
        <p style="color:#6b7280;font-size:12px">Or copy this link: ${link}</p>
      </div>
    `,
  }, { context: "sendVerificationEmail", idempotencyKey: idempotencyKey("verify-email", token) });
}

// ─── Onboarding drip ────────────────────────────────────────────────────────

/** Day 0 — sent immediately after successful signup. */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logMissingResendApiKey("sendWelcomeEmail");
    return;
  }

  const firstName = escapeHtml(name.split(" ")[0]);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `Welcome to uByte, ${firstName}! 🚀 Your first lesson is free`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hey ${firstName}, welcome aboard! 👋</h2>
          <p style="color:#6b7280">You just joined uByte. Every lesson is free, runs in your browser, and is built to get you writing code fast.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>📖 Interactive Tutorials</strong><br>
              <span style="color:#6b7280;font-size:14px">Short, step-by-step lessons in 9 languages with live code and instant feedback.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>💾 Progress That Sticks</strong><br>
              <span style="color:#6b7280;font-size:14px">Save your steps, bookmarks, and streaks so you can continue exactly where you left off.</span>
            </td></tr>
            <tr><td style="padding:10px 0">
              <strong>💡 Help When You Want It</strong><br>
              <span style="color:#6b7280;font-size:14px">Need extra support? Detailed hints are available later as an optional paid upgrade.</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}/tutorial" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Start your first lesson →</a>
          </div>
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendWelcomeEmail", idempotencyKey: idempotencyKey("welcome", to) });
}

/** Day 1 — 24h check-in: reinforce the value and nudge to complete first lesson. */
export async function sendDay1Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = escapeHtml(name.split(" ")[0]);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `${firstName}, your first lesson is waiting 👩‍💻`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hey ${firstName}, still thinking about it? 🤔</h2>
          <p style="color:#6b7280">You signed up yesterday — the hardest part is starting. Your first lesson takes less than 5 minutes and you'll write real, running code.</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 12px;font-weight:600">Pick where to start:</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
                <a href="${BASE_URL}/tutorial" style="color:#4f46e5;font-weight:600;text-decoration:none">📖 Start a tutorial</a>
                <span style="color:#9ca3af;font-size:13px;display:block">Interactive, step-by-step — 9 languages to choose from</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
                <a href="${BASE_URL}/tutorial/go" style="color:#4f46e5;font-weight:600;text-decoration:none">🐹 Begin with Go</a>
                <span style="color:#9ca3af;font-size:13px;display:block">A beginner-friendly way to experience the editor and lesson flow</span>
              </td></tr>
              <tr><td style="padding:8px 0">
                <a href="${BASE_URL}/pricing" style="color:#4f46e5;font-weight:600;text-decoration:none">💡 See how hints work</a>
                <span style="color:#9ca3af;font-size:13px;display:block">Lessons are free. Upgrade only if you want detailed hints later on.</span>
              </td></tr>
            </table>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Open uByte →</a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendDay1Email" });
}

/** Day 3 — encourage users who may not have returned yet. */
export async function sendDay3Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = escapeHtml(name.split(" ")[0]);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `${firstName}, ready for your next lesson? 🎯`,
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
            <a href="${BASE_URL}/tutorial/go" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open tutorials →</a>
          </div>
          <p style="color:#6b7280;font-size:14px">Every lesson is free, and if you ever get stuck you can unlock detailed hints later without leaving the lesson.</p>
          <a href="${BASE_URL}/pricing" style="color:#4f46e5;font-size:14px">See how hints work →</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendDay3Email" });
}

/** Day 7 — celebrate one week and reinforce the tutorial habit. */
export async function sendDay7Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = escapeHtml(name.split(" ")[0]);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `One week on uByte 🎉 — you're building real momentum`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">One week in, ${firstName}! 🎉</h2>
          <p style="color:#6b7280">You've been on uByte for a week. If you've written code, passed steps, or even just explored a new language, you're moving in the right direction.</p>
          <div style="background:#fff;border:2px solid #4f46e5;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 4px;font-weight:700;color:#4f46e5">📚 Keep the streak going</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">The fastest way to improve is still simple: open the next lesson, write code, and keep the habit alive.</p>
            <a href="${BASE_URL}/tutorial" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Continue learning →</a>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:16px 0">
            <p style="margin:0 0 4px;font-weight:700">💡 Want extra help?</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Lessons stay free. Pro is only for learners who want detailed hints and extra guidance without switching tabs.</p>
            <a href="${BASE_URL}/pricing" style="color:#4f46e5;font-size:14px;font-weight:600">See hint pricing →</a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendDay7Email" });
}

/** Weekly progress digest — sent every Sunday to active users. */
export async function sendWeeklyDigestEmail(opts: {
  to: string;
  name: string;
  streakDays: number;
  xp: number;
  tutorialsThisWeek: number;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { to, name, streakDays, xp, tutorialsThisWeek } = opts;
  const firstName = escapeHtml(name.split(" ")[0]);
  const totalActivity = tutorialsThisWeek;

  // Motivational headline based on activity level
  const headline =
    totalActivity >= 10
      ? `Incredible week, ${firstName}! 🔥`
      : totalActivity >= 5
      ? `Solid progress this week, ${firstName}! 💪`
      : `Good start this week, ${firstName}! 🚀`;

  const activityRows = [
    tutorialsThisWeek > 0 && `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>📖 Tutorial steps</strong><span style="float:right;font-size:22px;font-weight:800;color:#4f46e5">${tutorialsThisWeek}</span></td></tr>`,
    `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>🔥 Current streak</strong><span style="float:right;font-size:22px;font-weight:800;color:#f59e0b">${streakDays} days</span></td></tr>`,
    `<tr><td style="padding:10px 0"><strong>⭐ Total XP</strong><span style="float:right;font-size:22px;font-weight:800;color:#4f46e5">${xp.toLocaleString()}</span></td></tr>`,
  ].filter(Boolean).join("");

  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `Your uByte weekly recap — ${tutorialsThisWeek} lessons this week`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
          <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Weekly Progress Report</p>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 4px">${headline}</h2>
          <p style="color:#6b7280;margin:0 0 24px">Here's what you achieved on uByte this week:</p>

          <table style="width:100%;border-collapse:collapse">
            ${activityRows}
          </table>

          <div style="background:#fff;border:2px solid #4f46e5;border-radius:10px;padding:16px;margin:24px 0;text-align:center">
            <p style="margin:0 0 4px;font-weight:700;color:#4f46e5">Keep the momentum going!</p>
            <p style="color:#6b7280;margin:0 0 14px;font-size:13px">
              ${streakDays >= 7
                ? `${streakDays}-day streak — you're on a roll. Don't break it!`
                : "Build your streak — code every day and watch it grow."}
            </p>
            <a href="${BASE_URL}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Continue learning →</a>
          </div>

          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin:0 0 20px">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151">This week on uByte:</p>
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr>
                <td style="padding:4px 0"><a href="${BASE_URL}/tutorial" style="color:#4f46e5;text-decoration:none">📖 Browse all tutorials</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0"><a href="${BASE_URL}/leaderboard" style="color:#4f46e5;text-decoration:none">🏆 See the leaderboard</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0"><a href="${BASE_URL}/pricing" style="color:#4f46e5;text-decoration:none">💡 Learn how paid hints work</a></td>
              </tr>
            </table>
          </div>

          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendWeeklyDigestEmail" });
}

/** Sent after a user successfully upgrades to Pro or Yearly. */
export async function sendUpgradeEmail(
  to: string,
  name: string,
  plan: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  const planLabel = plan.includes("yearly") ? "Yearly Pro" : "Monthly Pro";
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `Welcome to ${planLabel}, ${firstName}! 🎉 — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">You're officially Pro, ${firstName}! 🚀</h2>
          <p style="color:#6b7280">Your <strong>${planLabel}</strong> is now active. Here's what you just unlocked:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>💡 Hints when you're stuck</strong><br>
              <span style="color:#6b7280;font-size:14px">Hit a wall in any lesson and ask for a detailed hint without leaving the page.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>🧭 Extra guidance inside lessons</strong><br>
              <span style="color:#6b7280;font-size:14px">Get unstuck faster with more context while you work through the tutorial flow.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>📚 All lessons still included</strong><br>
              <span style="color:#6b7280;font-size:14px">Your upgrade adds help, not paywalls. Every tutorial stays available across all 9 languages.</span>
            </td></tr>
            <tr><td style="padding:10px 0">
              <strong>⚡ Faster momentum</strong><br>
              <span style="color:#6b7280;font-size:14px">Spend less time stuck and more time finishing lessons, building streaks, and moving forward.</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Start learning →</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">You're receiving this because you just upgraded to ${planLabel} on uByte.</p>
        </div>
      </div>
    `,
  }, { context: "sendUpgradeEmail" });
}

/** Day 14 — win-back for users who haven't logged in since signup week. */
export async function sendDay14WinBackEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `${firstName}, are you still there? 👋`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hey ${firstName}, we miss you 👋</h2>
          <p style="color:#6b7280">It's been two weeks since you signed up. We know life gets busy — but your coding skills won't build themselves!</p>
          <div style="background:#fff;border:2px solid #4f46e5;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px;font-weight:700;color:#4f46e5">Pick up right where you left off</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Even 10 minutes a day adds up. Start with one lesson — that's all it takes to build momentum again.</p>
            <a href="${BASE_URL}/tutorial/go" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Resume my journey →</a>
          </div>
          <p style="color:#6b7280;font-size:14px">Need a little help once you're back? Lessons stay free, and detailed hints are there if you want them.</p>
          <a href="${BASE_URL}/pricing" style="color:#4f46e5;font-size:14px;font-weight:600">See hint pricing →</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendDay14WinBackEmail" });
}

/** Day 30 — final win-back for churned users. */
export async function sendDay30WinBackEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: `Last chance to restart your coding habit, ${firstName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#18181b;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">One month. Same offer. Zero excuses.</h2>
          <p style="color:#6b7280">Hi ${firstName},</p>
          <p style="color:#6b7280">It's been 30 days since you joined uByte. We're not going to spam you after this — but we do want to give you one last nudge.</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px;font-weight:700">What you're missing:</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#6b7280">
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">📖 Interactive coding lessons in 9 languages</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">💾 Saved progress, bookmarks, and streaks</td></tr>
              <tr><td style="padding:6px 0">💡 Optional detailed hints when you want extra help</td></tr>
            </table>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}" style="display:inline-block;padding:14px 28px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">I'm back — let's go →</a>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center">This is our last automated email about your progress. We respect your inbox.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendDay30WinBackEmail" });
}

/** Trial ending soon — sent 2 days before trial expiry. */
export async function sendTrialEndingEmail(
  to: string,
  name: string,
  daysLeft: number,
  plan: "trial" | "trial_yearly"
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  const planType = plan === "trial_yearly" ? "Yearly" : "Monthly";
  const isUrgent = daysLeft <= 1;

  await sendEmail(resend, {
    from: FROM,
    to,
    subject: isUrgent
      ? `⚠️ Your uByte trial ends tomorrow — subscribe to keep access`
      : `Your uByte free trial ends in ${daysLeft} days`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:${isUrgent ? "#b45309" : "#4f46e5"};padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:800">uByte</span>
          <p style="color:${isUrgent ? "#fde68a" : "#c7d2fe"};margin:4px 0 0;font-size:13px">
            ${isUrgent ? "Trial ending tomorrow" : `Trial ending in ${daysLeft} days`}
          </p>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">${isUrgent ? `⚠️ Last day, ${firstName}!` : `Hey ${firstName}, your trial is almost up`}</h2>
          <p style="color:#6b7280">
            Your 7-day free trial ${isUrgent ? "ends tomorrow" : `ends in ${daysLeft} days`}.
            After that, you'll lose access to all Pro features unless you subscribe.
          </p>
          <div style="background:#fff;border:2px solid ${isUrgent ? "#b45309" : "#4f46e5"};border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 4px;font-weight:700;color:${isUrgent ? "#b45309" : "#4f46e5"}">What you'll keep with a subscription:</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;color:#6b7280">
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">📖 Unlimited tutorials in all 9 languages</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">💡 Detailed hints when you're stuck in a lesson</td></tr>
              <tr><td style="padding:6px 0">🧭 Extra help that keeps you moving without leaving the editor</td></tr>
            </table>
            <a href="${BASE_URL}/pricing" style="display:inline-block;padding:12px 24px;background:${isUrgent ? "#b45309" : "#4f46e5"};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Subscribe to ${planType} Pro →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">No charge during the trial. Cancel anytime after subscribing.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:11px;text-align:center">
            You're receiving this because you're on a free trial at uByte.<br>
            <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>
          </p>
        </div>
      </div>
    `,
  }, { context: "sendTrialEndingEmail" });
}

/** Password reset — sent when a user requests a password reset. */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logMissingResendApiKey("sendPasswordResetEmail");
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] password-reset token for ${to}: ${resetToken}`);
    }
    return;
  }

  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: "Reset your password — uByte",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Reset your password</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#6b7280;font-size:12px">Or copy this link: ${resetLink}</p>
      </div>
    `,
  }, { context: "sendPasswordResetEmail", idempotencyKey: idempotencyKey("password-reset", resetToken) });
}

/**
 * Forgot-password was requested but the account only has Google sign-in (no local password yet).
 * Explains why no reset link was sent and how to sign in or add a password.
 */
export async function sendPasswordResetGoogleOnlyEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logMissingResendApiKey("sendPasswordResetGoogleOnlyEmail");
    return;
  }

  const safeName = escapeHtml(name);
  await sendEmail(resend, {
    from: FROM,
    to,
    subject: "Your uByte account uses Google sign-in",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Password reset</h2>
        <p>Hi ${safeName},</p>
        <p>We received a request to reset the password for <strong>${escapeHtml(to)}</strong>.</p>
        <p>This account was created with <strong>Google sign-in</strong> and does not have a separate uByte password yet, so there is no reset link to send.</p>
        <p><strong>To sign in:</strong> use <strong>Continue with Google</strong> on the <a href="${BASE_URL}/login">login page</a>.</p>
        <p>If you want to use email and password as well, sign in with Google, open <a href="${BASE_URL}/settings">Settings</a>, and add a password under Security.</p>
        <p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  }, {
    context: "sendPasswordResetGoogleOnlyEmail",
    idempotencyKey: idempotencyKey("forgot-password-google-only", to),
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
  const name    = escapeHtml(opts.fromName);
  const subject = escapeHtml(opts.subject);
  const message = escapeHtml(opts.message);
  await sendEmail(resend, {
    from: FROM,
    to: SUPPORT,
    replyTo: opts.fromEmail,
    subject: `[uByte Contact] ${opts.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#4f46e5">New contact form message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:4px 8px;font-weight:bold;width:100px">From</td><td>${name} &lt;${escapeHtml(opts.fromEmail)}&gt;</td></tr>
          <tr><td style="padding:4px 8px;font-weight:bold">Subject</td><td>${subject}</td></tr>
        </table>
        <div style="background:#f4f4f5;border-radius:8px;padding:16px;white-space:pre-wrap">${message}</div>
        <p style="color:#71717a;font-size:12px;margin-top:16px">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `,
  }, { context: "sendContactEmail" });
}

/** Sent daily to users who have unread discussion reply/mention notifications. */
export async function sendNotificationDigestEmail(opts: {
  to: string;
  name: string;
  notifications: { title: string; message: string }[];
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { to, name, notifications } = opts;
  const firstName = escapeHtml(name.split(" ")[0]);
  const count = notifications.length;
  const subject =
    count === 1
      ? `You have 1 new notification on uByte`
      : `You have ${count} new notifications on uByte`;

  const notifRows = notifications
    .map(
      (n) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">${escapeHtml(n.title)}</p>
            <p style="margin:0;font-size:13px;color:#6b7280">${escapeHtml(n.message)}</p>
          </td>
        </tr>`,
    )
    .join("");

  await sendEmail(resend, {
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:26px;font-weight:800;letter-spacing:-1px">uByte</span>
          <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Notification digest</p>
        </div>
        <div style="background:#f9fafb;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 4px;font-size:18px">Hey ${firstName} 👋</h2>
          <p style="color:#6b7280;margin:0 0 20px;font-size:14px">
            You have ${count} unread ${count === 1 ? "notification" : "notifications"} since your last visit:
          </p>

          <table style="width:100%;border-collapse:collapse">
            ${notifRows}
          </table>

          <div style="text-align:center;margin:24px 0 0">
            <a href="${BASE_URL}/notifications"
               style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              View all notifications →
            </a>
          </div>

          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }, { context: "sendNotificationDigestEmail" });
}
