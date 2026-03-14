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
import { makeUnsubscribeUrl } from "@/lib/unsubscribe";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev";

/** Standard unsubscribe footer for all marketing emails. */
function unsubFooter(email: string): string {
  const url = makeUnsubscribeUrl(email);
  return `<p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px">
    You're receiving this because you have an account on uByte.<br>
    <a href="${url}" style="color:#9ca3af">Unsubscribe from marketing emails</a> ·
    <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>
  </p>`;
}

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

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 Keep your ${streakDays}-day streak alive — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0891b2">Your streak is at risk!</h2>
        <p>Hi ${name},</p>
        <p>You have a <strong>${streakDays}-day</strong> streak on uByte — don't let it slip today!</p>
        <a href="${BASE_URL}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Keep my streak 🔥</a>
        <p style="color:#6b7280;font-size:13px">Complete any tutorial step to keep your streak going.</p>
        ${unsubFooter(to)}
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
        <a href="${siteUrl}/settings" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Secure my account</a>
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
              <span style="color:#6b7280;font-size:14px">Step-by-step lessons in Go, Python, JavaScript, C++, Java, Rust, and C# — with a live code editor.</span>
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
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  });
}

/** Day 1 — 24h check-in: reinforce the value and nudge to complete first lesson. */
export async function sendDay1Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
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
                <a href="${BASE_URL}/tutorial/go/getting-started" style="color:#4f46e5;font-weight:600;text-decoration:none">📖 Learn Go from scratch</a>
                <span style="color:#9ca3af;font-size:13px;display:block">Interactive, step-by-step — great for beginners</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
                <a href="${BASE_URL}/practice/go" style="color:#4f46e5;font-weight:600;text-decoration:none">💼 Solve an interview problem</a>
                <span style="color:#9ca3af;font-size:13px;display:block">Practice the coding questions that get you hired</span>
              </td></tr>
              <tr><td style="padding:8px 0">
                <a href="${BASE_URL}/daily" style="color:#4f46e5;font-weight:600;text-decoration:none">⚡ Today's daily challenge</a>
                <span style="color:#9ca3af;font-size:13px;display:block">One problem a day keeps interview rust away</span>
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
  });
}

/** Day 3 — encourage users who may not have returned yet. */
export async function sendDay3Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  try { await resend.emails.send({
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
            <a href="${BASE_URL}/tutorial/go" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open tutorials →</a>
          </div>
          <p style="color:#6b7280;font-size:14px">Or jump straight into an interview prep problem:</p>
          <a href="${BASE_URL}/practice" style="color:#4f46e5;font-size:14px">Browse interview questions →</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }); } catch (err) { console.error("[email] sendDay3Email failed:", err); }
}

/** Day 7 — celebrate one week, push certifications and Pro. */
export async function sendDay7Email(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  try { await resend.emails.send({
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
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  }); } catch (err) { console.error("[email] sendDay7Email failed:", err); }
}

/** Weekly progress digest — sent every Sunday to active users. */
export async function sendWeeklyDigestEmail(opts: {
  to: string;
  name: string;
  streakDays: number;
  xp: number;
  problemsThisWeek: number;
  tutorialsThisWeek: number;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { to, name, streakDays, xp, problemsThisWeek, tutorialsThisWeek } = opts;
  const firstName = name.split(" ")[0];
  const totalActivity = problemsThisWeek + tutorialsThisWeek;

  // Motivational headline based on activity level
  const headline =
    totalActivity >= 10
      ? `Incredible week, ${firstName}! 🔥`
      : totalActivity >= 5
      ? `Solid progress this week, ${firstName}! 💪`
      : `Good start this week, ${firstName}! 🚀`;

  const activityRows = [
    problemsThisWeek > 0 && `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>💼 Problems solved</strong><span style="float:right;font-size:22px;font-weight:800;color:#4f46e5">${problemsThisWeek}</span></td></tr>`,
    tutorialsThisWeek > 0 && `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>📖 Tutorial steps</strong><span style="float:right;font-size:22px;font-weight:800;color:#4f46e5">${tutorialsThisWeek}</span></td></tr>`,
    `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>🔥 Current streak</strong><span style="float:right;font-size:22px;font-weight:800;color:#f59e0b">${streakDays} days</span></td></tr>`,
    `<tr><td style="padding:10px 0"><strong>⭐ Total XP</strong><span style="float:right;font-size:22px;font-weight:800;color:#0891b2">${xp.toLocaleString()}</span></td></tr>`,
  ].filter(Boolean).join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your uByte weekly recap — ${problemsThisWeek} problems, ${tutorialsThisWeek} lessons this week`,
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
                <td style="padding:4px 0"><a href="${BASE_URL}/daily" style="color:#4f46e5;text-decoration:none">⚡ Today's daily challenge</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0"><a href="${BASE_URL}/practice" style="color:#4f46e5;text-decoration:none">💼 Browse all interview problems</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0"><a href="${BASE_URL}/certifications" style="color:#4f46e5;text-decoration:none">🏅 Take a certification exam</a></td>
              </tr>
            </table>
          </div>

          ${unsubFooter(to)}
        </div>
      </div>
    `,
  });
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
  await resend.emails.send({
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
          <p style="color:#6b7280">Your <strong>${planLabel}</strong> is now active. Here's everything that's now unlocked:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>📖 Unlimited tutorials</strong><br>
              <span style="color:#6b7280;font-size:14px">All languages, all lessons — no limits.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">
              <strong>💼 Unlimited interview prep</strong><br>
              <span style="color:#6b7280;font-size:14px">Every practice problem, with AI hints on demand.</span>
            </td></tr>
            <tr><td style="padding:10px 0">
              <strong>🏅 Certification exams</strong><br>
              <span style="color:#6b7280;font-size:14px">Take exams, earn verifiable certificates, add them to LinkedIn.</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="${BASE_URL}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Start learning →</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">You're receiving this because you just upgraded to ${planLabel} on uByte.</p>
        </div>
      </div>
    `,
  });
}

/** Sent when a user earns a certification. */
export async function sendCertificationEmail(
  to: string,
  name: string,
  language: string,
  certificateUrl: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  const langLabel = LANGUAGES[language as SupportedLanguage]?.name ?? language;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You passed the ${langLabel} certification! 🏅 — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <div style="text-align:center;margin-bottom:20px">
            <span style="font-size:56px">🏅</span>
          </div>
          <h2 style="margin:0 0 8px;text-align:center">Congratulations, ${firstName}!</h2>
          <p style="color:#6b7280;text-align:center">You've passed the <strong>${langLabel} certification</strong> on uByte. Your certificate is ready to view and share.</p>
          <div style="background:#fff;border:2px solid #4f46e5;border-radius:10px;padding:20px;margin:20px 0;text-align:center">
            <p style="margin:0 0 4px;font-weight:700;color:#4f46e5">Your ${langLabel} Certificate</p>
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Each certificate has a unique ID — share the link with anyone who wants to verify it.</p>
            <a href="${certificateUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View your certificate →</a>
          </div>
          <p style="color:#6b7280;font-size:14px;text-align:center">You earned it. Keep going — more certifications await.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">You're receiving this because you just earned a certificate on uByte. <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>.</p>
        </div>
      </div>
    `,
  });
}

/** Sent when a user fails a certification exam — encourages a retake. */
export async function sendExamFailedEmail(
  to: string,
  name: string,
  language: string,
  score: number,
  correct: number,
  total: number,
  passPercent: number,
  retakeUrl: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  const langLabel = LANGUAGES[language as SupportedLanguage]?.name ?? language;
  const needed = Math.ceil((total * passPercent) / 100);
  const gap = needed - correct;
  // Only send if the user was reasonably close (within 20 percentage points) — avoid
  // emailing users who scored very low, as it may feel discouraging rather than motivating.
  const scoreDiff = passPercent - score;
  if (scoreDiff > 20) return;

  try { await resend.emails.send({
    from: FROM,
    to,
    subject: `So close! Your ${langLabel} exam result — uByte`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#18181b">
        <div style="background:#4f46e5;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px">uByte</span>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="margin:0 0 8px">Hi ${firstName} — you almost had it.</h2>
          <p style="color:#6b7280;margin:0 0 24px">You scored <strong style="color:#18181b">${score}%</strong> on the ${langLabel} certification. You needed ${passPercent}% to pass. That's just ${gap} more question${gap === 1 ? "" : "s"} — you're very close.</p>

          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:0 0 24px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px">Your score</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;color:#f59e0b;font-size:18px">${score}%</td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280;font-size:14px">Correct answers</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;color:#18181b">${correct} / ${total}</td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280;font-size:14px">Passing score</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;color:#18181b">${passPercent}%</td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280;font-size:14px">Needed to pass</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;color:#18181b">${needed} / ${total}</td>
              </tr>
            </table>
          </div>

          <div style="text-align:center;margin-bottom:24px">
            <p style="color:#6b7280;font-size:14px;margin:0 0 16px">Review the topics you missed and give it another shot. You can retake it as many times as you need.</p>
            <a href="${retakeUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Retake the ${langLabel} exam →</a>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">You're receiving this because you recently took a certification exam on uByte. <a href="${BASE_URL}/settings" style="color:#9ca3af">Manage preferences</a>.</p>
        </div>
      </div>
    `,
  }); } catch (err) { console.error("[email] sendExamFailedEmail failed:", err); }
}

/** Day 14 — win-back for users who haven't logged in since signup week. */
export async function sendDay14WinBackEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
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
            <p style="color:#6b7280;margin:0 0 16px;font-size:14px">Even 10 minutes a day adds up. Start with one lesson or one practice problem — that's all it takes to build momentum.</p>
            <a href="${BASE_URL}/tutorial/go" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Resume my journey →</a>
          </div>
          <p style="color:#6b7280;font-size:14px">Or try the daily challenge — a new problem every day, takes about 15 minutes:</p>
          <a href="${BASE_URL}/daily" style="color:#4f46e5;font-size:14px;font-weight:600">⚡ Today's challenge →</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          ${unsubFooter(to)}
        </div>
      </div>
    `,
  });
}

/** Day 30 — final win-back for churned users. */
export async function sendDay30WinBackEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const firstName = name.split(" ")[0];
  await resend.emails.send({
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
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">📖 Interactive coding lessons in 7 languages</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">💼 Real interview questions with AI hints</td></tr>
              <tr><td style="padding:6px 0">🏅 Certifications to add to your LinkedIn</td></tr>
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
  });
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

  await resend.emails.send({
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
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">📖 Unlimited tutorials in all 7 languages</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">💼 All 70+ interview practice problems + AI hints</td></tr>
              <tr><td style="padding:6px 0">🏅 Certification exams + shareable certificates</td></tr>
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
  });
}

/** Password reset — sent when a user requests a password reset. */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] password-reset token for ${to}: ${resetToken}`);
    }
    return;
  }

  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
  await resend.emails.send({
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
  });
}

/** Escape user-supplied text before embedding in HTML to prevent XSS. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  await resend.emails.send({
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
  });
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
  const firstName = name.split(" ")[0];
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
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">${n.title}</p>
            <p style="margin:0;font-size:13px;color:#6b7280">${n.message}</p>
          </td>
        </tr>`,
    )
    .join("");

  await resend.emails.send({
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
  });
}
