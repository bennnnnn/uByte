import { getSql } from "./client";
import type { PasswordResetToken } from "./types";
import { hashToken } from "@/lib/token-security";

export async function createPasswordResetToken(
  userId: number,
  token: string,
  expiresAt: string
): Promise<void> {
  const sql = getSql();
  const tokenHash = await hashToken(token);
  await sql`UPDATE password_reset_tokens SET used = 1 WHERE user_id = ${userId} AND used = 0`;
  await sql`INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (${userId}, ${tokenHash}, ${expiresAt})`;
}

export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | undefined> {
  const sql = getSql();
  const tokenHash = await hashToken(token);
  const [row] = await sql`
    SELECT * FROM password_reset_tokens
    WHERE (token = ${tokenHash} OR token = ${token}) AND used = 0 AND expires_at::timestamptz > NOW()
  `;
  return row as PasswordResetToken | undefined;
}

export async function markResetTokenUsed(tokenId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE password_reset_tokens SET used = 1 WHERE id = ${tokenId}`;
}
