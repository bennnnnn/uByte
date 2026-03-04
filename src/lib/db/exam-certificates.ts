import { getSql } from "./client";

export interface ExamCertificateRow {
  id: string;
  user_id: number;
  lang: string;
  attempt_id: string;
  passed_at: string;
}

export async function createCertificate(
  userId: number,
  lang: string,
  attemptId: string
): Promise<string> {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO exam_certificates (user_id, lang, attempt_id)
    VALUES (${userId}, ${lang}, ${attemptId})
    RETURNING id
  `;
  return (row as { id: string }).id;
}

export async function getCertificatesByUser(userId: number): Promise<ExamCertificateRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, user_id, lang, attempt_id, passed_at FROM exam_certificates
    WHERE user_id = ${userId} ORDER BY passed_at DESC
  `;
  return rows as ExamCertificateRow[];
}

export async function getCertificateById(certificateId: string): Promise<ExamCertificateRow | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, user_id, lang, attempt_id, passed_at FROM exam_certificates WHERE id = ${certificateId}
  `;
  return (row as ExamCertificateRow | undefined) ?? null;
}

export async function getCertificateByAttemptId(attemptId: string): Promise<ExamCertificateRow | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, user_id, lang, attempt_id, passed_at FROM exam_certificates WHERE attempt_id = ${attemptId}
  `;
  return (row as ExamCertificateRow | undefined) ?? null;
}
