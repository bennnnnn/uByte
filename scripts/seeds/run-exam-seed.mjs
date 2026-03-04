#!/usr/bin/env node
/**
 * Seed exam_questions from JSON file(s).
 * Each file or array item: { lang, prompt, choices, correct_index, explanation? }
 * Usage: node scripts/seeds/run-exam-seed.mjs [file1.json file2.json ...]
 * Default: seeds all scripts/seeds/exam-questions-*.json
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

function loadEnv() {
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
loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Use .env.local or set the env var.");
  process.exit(1);
}

const sql = neon(url);
const VALID_LANGS = new Set(["go", "python", "javascript", "java", "rust", "cpp"]);

function loadQuestions(files) {
  const all = [];
  for (const f of files) {
    const path = join(__dirname, f);
    if (!existsSync(path)) {
      console.warn("Skip (not found):", f);
      continue;
    }
    const data = JSON.parse(readFileSync(path, "utf8"));
    const arr = Array.isArray(data) ? data : (data.questions || []);
    for (const r of arr) {
      if (r && r.lang && r.prompt && Array.isArray(r.choices) && typeof r.correct_index === "number") {
        all.push({
          lang: String(r.lang).toLowerCase(),
          prompt: String(r.prompt),
          choices: r.choices.map((c) => String(c)),
          correct_index: Number(r.correct_index),
          explanation: r.explanation != null ? String(r.explanation) : null,
        });
      }
    }
  }
  return all;
}

async function main() {
  const args = process.argv.slice(2);
  const files = args.length > 0 ? args : readdirSync(__dirname).filter((f) => f.startsWith("exam-questions-") && f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No JSON files. Add exam-questions-go.json (etc.) or pass file paths.");
    process.exit(0);
  }
  const questions = loadQuestions(files);
  console.log("Loaded", questions.length, "questions from", files.length, "file(s).");
  if (questions.length === 0) {
    console.log("No valid rows to insert.");
    process.exit(0);
  }
  let ok = 0;
  let err = 0;
  for (const r of questions) {
    if (!VALID_LANGS.has(r.lang)) {
      console.warn("Invalid lang:", r.lang);
      err++;
      continue;
    }
    try {
      const choicesJson = JSON.stringify(r.choices);
      await sql`INSERT INTO exam_questions (lang, prompt, choices_json, correct_index, explanation)
        VALUES (${r.lang}, ${r.prompt}, ${choicesJson}::jsonb, ${r.correct_index}, ${r.explanation})`;
      ok++;
    } catch (e) {
      console.warn("Insert failed:", e?.message || e);
      err++;
    }
  }
  console.log("Inserted:", ok, "Errors:", err);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
