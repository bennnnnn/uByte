/**
 * Generates one-click unsubscribe URLs for marketing emails.
 * Token = HMAC-SHA256(email, UNSUBSCRIBE_SECRET || JWT_SECRET).
 */
import { createHmac } from "crypto";
import { BASE_URL } from "@/lib/constants";

export function makeUnsubscribeUrl(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.JWT_SECRET ?? "fallback-secret";
  const token = createHmac("sha256", secret).update(email.toLowerCase().trim()).digest("hex");
  return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
