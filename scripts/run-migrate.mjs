#!/usr/bin/env node
/**
 * Run scripts/migrate.sql against the database.
 * Loads DATABASE_URL from .env.local if present.
 * Usage: node scripts/run-migrate.mjs   (or: npm run migrate)
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local
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
  console.error("DATABASE_URL is not set. Add it to .env.local or set the env var.");
  process.exit(1);
}

const sql = neon(url);
const migratePath = join(__dirname, "migrate.sql");
const fullSql = readFileSync(migratePath, "utf8");

// Remove single-line comments, then split into statements (each CREATE TABLE / CREATE INDEX)
const cleaned = fullSql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

// Split into statements: split at ";\n" followed by "CREATE" (each statement ends with ";")
const statements = cleaned
  .split(/;\s*\n\s*(?=CREATE\s)/)
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => (s.endsWith(";") ? s : s + ";"));

async function run() {
  try {
    for (let i = 0; i < statements.length; i++) {
      const st = statements[i];
      if (!st) continue;
      await sql.query(st, []);
      console.log(`  OK: ${st.slice(0, 60).replace(/\s+/g, " ")}...`);
    }
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

run();
