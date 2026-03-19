#!/usr/bin/env node
/**
 * Seed the practice_problems table from the TypeScript source files.
 *
 * Usage:
 *   npm run seed:problems
 *
 * This is idempotent — it upserts by slug, so re-running is safe.
 * Run after `npm run migrate` to ensure the table exists first.
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

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
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(url);

// We use the compiled Next.js output isn't available here, so we load the
// built JS from .next/server if available, otherwise we ask the user to
// run a quick build step. For now, we use a JSON export approach.

// Import the problems by loading the compiled TypeScript via tsx or ts-node.
// Since this runs as a plain mjs file, we rely on the user having run `next build`
// OR we use a dynamic import with tsx loader.
//
// Simpler approach: read the seed JSON files that already exist for exams,
// and we create a separate JSON seed for practice problems.

const PROBLEMS_JSON_PATH = join(__dirname, "practice-problems.json");

if (!existsSync(PROBLEMS_JSON_PATH)) {
  console.error(
    `practice-problems.json not found at ${PROBLEMS_JSON_PATH}.\n` +
    `Run: npx tsx scripts/seeds/export-practice-problems.ts first.`
  );
  process.exit(1);
}

const problems = JSON.parse(readFileSync(PROBLEMS_JSON_PATH, "utf8"));

console.log(`\nSeeding ${problems.length} practice problems...\n`);

let inserted = 0;
let updated = 0;

for (const p of problems) {
  try {
    const result = await sql`
      INSERT INTO practice_problems (slug, title, difficulty, category, description, examples, starter, test_cases, judge_harness)
      VALUES (
        ${p.slug},
        ${p.title},
        ${p.difficulty},
        ${p.category ?? null},
        ${p.description},
        ${JSON.stringify(p.examples ?? [])}::jsonb,
        ${JSON.stringify(p.starter ?? {})}::jsonb,
        ${JSON.stringify(p.testCases ?? [])}::jsonb,
        ${JSON.stringify(p.judgeHarness ?? {})}::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET
        title         = EXCLUDED.title,
        difficulty    = EXCLUDED.difficulty,
        category      = EXCLUDED.category,
        description   = EXCLUDED.description,
        examples      = EXCLUDED.examples,
        starter       = EXCLUDED.starter,
        test_cases    = EXCLUDED.test_cases,
        judge_harness = EXCLUDED.judge_harness,
        updated_at    = NOW()
      RETURNING (xmax = 0) AS was_inserted
    `;
    if (result[0]?.was_inserted) inserted++;
    else updated++;
    process.stdout.write(".");
  } catch (err) {
    console.error(`\nFailed to upsert "${p.slug}": ${err.message}`);
  }
}

console.log(`\n\n✅ Done. Inserted: ${inserted}, Updated: ${updated}\n`);
