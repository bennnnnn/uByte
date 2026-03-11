#!/usr/bin/env node
/**
 * Run database migrations against the Neon PostgreSQL database.
 *
 * Execution order:
 *   1. scripts/migrate.sql             — base schema (CREATE TABLE IF NOT EXISTS)
 *   2. scripts/migrations/NNN_*.sql    — numbered migrations in ascending order
 *
 * All statements are idempotent (IF NOT EXISTS / DO NOTHING / ON CONFLICT).
 * Safe to re-run at any time.
 *
 * Usage:
 *   node scripts/run-migrate.mjs       (or: npm run migrate)
 *
 * Loads DATABASE_URL from .env.local if present.
 */
import { readFileSync, existsSync, readdirSync } from "fs";
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

/**
 * Parse a SQL file into individual statements, stripping single-line comments.
 * Splits at ";\n" followed by a SQL keyword (CREATE, INSERT, ALTER, DROP, etc.).
 */
function parseStatements(sqlText) {
  const cleaned = sqlText
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return cleaned
    .split(/;\s*\n\s*(?=(?:CREATE|INSERT|ALTER|DROP|UPDATE|DELETE|DO)\s)/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(";") ? s : s + ";"));
}

async function runFile(filePath, label) {
  console.log(`\n── ${label}`);
  const fullSql = readFileSync(filePath, "utf8");
  const statements = parseStatements(fullSql);

  for (const st of statements) {
    if (!st.trim() || st.trim() === ";") continue;
    try {
      await sql.query(st, []);
      console.log(`  ✓ ${st.slice(0, 70).replace(/\s+/g, " ").trimEnd()}…`);
    } catch (err) {
      console.error(`  ✗ Failed: ${st.slice(0, 120)}`);
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }
}

async function run() {
  // 1. Base schema
  const basePath = join(__dirname, "migrate.sql");
  if (existsSync(basePath)) {
    await runFile(basePath, "migrate.sql (base schema)");
  }

  // 2. Numbered migrations — run in ascending filename order
  const migrationsDir = join(__dirname, "migrations");
  if (existsSync(migrationsDir)) {
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql") && /^\d{3}_/.test(f))
      .sort(); // lexicographic sort = numeric order for NNN_ prefix

    for (const file of files) {
      await runFile(join(migrationsDir, file), `migrations/${file}`);
    }
  }

  console.log("\n✅ All migrations completed successfully.\n");
}

run().catch((err) => {
  console.error("\n❌ Migration failed:", err.message);
  process.exit(1);
});
