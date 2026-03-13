import { getSql } from "./client";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

/** Persist a contact form submission to the DB. */
export async function saveContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (${data.name}, ${data.email}, ${data.subject}, ${data.message})
  `;
}

/** Return all contact messages, newest first (admin only). */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, subject, message, read, created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return rows as ContactMessage[];
}

/** Mark a message as read. */
export async function markContactMessageRead(id: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE contact_messages SET read = true WHERE id = ${id}`;
}

/** Mark all messages as read. */
export async function markAllContactMessagesRead(): Promise<void> {
  const sql = getSql();
  await sql`UPDATE contact_messages SET read = true WHERE read = false`;
}

/** Delete a contact message (admin only). */
export async function deleteContactMessage(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
}
