#!/usr/bin/env node
/**
 * Run scripts/migrations/003_practice_exams.sql (exam_questions, exam_attempts, etc.)
 * Usage: node scripts/run-migrate-003.mjs
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const value = m[2].replace(/^["']|["']$/g, "").trim();
      process.env[m[1]] = value;
    }
  }
}
loadEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS exam_questions (
      id BIGSERIAL PRIMARY KEY,
      lang TEXT NOT NULL,
      prompt TEXT NOT NULL,
      choices_json JSONB NOT NULL,
      correct_index INT NOT NULL,
      explanation TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    console.log("OK: exam_questions");
    await sql`CREATE INDEX IF NOT EXISTS idx_exam_questions_lang ON exam_questions(lang)`;
    console.log("OK: idx_exam_questions_lang");
    await sql`CREATE TABLE IF NOT EXISTS exam_attempts (
      id UUID PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lang TEXT NOT NULL,
      question_ids_json JSONB NOT NULL,
      choices_order_json JSONB NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      submitted_at TIMESTAMPTZ,
      score INT,
      passed BOOLEAN
    )`;
    console.log("OK: exam_attempts");
    await sql`CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_lang ON exam_attempts(user_id, lang)`;
    await sql`CREATE TABLE IF NOT EXISTS exam_answers (
      attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
      chosen_index INT NOT NULL,
      PRIMARY KEY (attempt_id, question_id)
    )`;
    console.log("OK: exam_answers");
    await sql`CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers(attempt_id)`;
    await sql`CREATE TABLE IF NOT EXISTS exam_certificates (
      id UUID PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lang TEXT NOT NULL,
      attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      passed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    console.log("OK: exam_certificates");
    await sql`CREATE INDEX IF NOT EXISTS idx_exam_certificates_user ON exam_certificates(user_id)`;
    console.log("Migration 003 completed.");
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
}

run();
