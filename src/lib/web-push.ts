/**
 * Web Push notification sender using the `web-push` library.
 *
 * ─── SETUP CHECKLIST ─────────────────────────────────────────────────────────
 * 1. Add these to your Vercel environment variables:
 *    VAPID_PUBLIC_KEY   = <generated value>
 *    VAPID_PRIVATE_KEY  = <generated value>
 *    VAPID_SUBJECT      = mailto:hello@ubyte.dev  (your support email)
 *
 *    To regenerate keys, run:
 *      node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k))"
 *
 * 2. NEXT_PUBLIC_VAPID_PUBLIC_KEY must equal VAPID_PUBLIC_KEY
 *    (the client needs it to create a subscription).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import webpush from "web-push";

const publicKey  = process.env.VAPID_PUBLIC_KEY  ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
const subject    = process.env.VAPID_SUBJECT     ?? "mailto:hello@ubyte.dev";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/**
 * Sends a single push notification. Returns true on success, false on failure.
 * A 410 (Gone) response means the subscription has expired and should be deleted.
 */
export async function sendPushNotification(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ ok: boolean; expired: boolean }> {
  if (!publicKey || !privateKey) {
    console.warn("[web-push] VAPID keys not configured — skipping push");
    return { ok: false, expired: false };
  }
  try {
    await webpush.sendNotification(
      { endpoint, keys },
      JSON.stringify(payload),
      { urgency: "normal" }
    );
    return { ok: true, expired: false };
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      // Subscription no longer valid — caller should delete it
      return { ok: false, expired: true };
    }
    console.error("[web-push] sendNotification error:", err);
    return { ok: false, expired: false };
  }
}
