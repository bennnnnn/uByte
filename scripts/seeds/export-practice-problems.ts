/**
 * Export all in-memory practice problems to JSON so the seed script can load them.
 *
 * Usage (from project root):
 *   npx tsx scripts/seeds/export-practice-problems.ts
 *
 * Then run:
 *   npm run seed:problems
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getAllPracticeProblems } from "../../src/lib/practice/problems";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "practice-problems.json");

const problems = getAllPracticeProblems();
writeFileSync(outPath, JSON.stringify(problems, null, 2));
console.log(`✅ Exported ${problems.length} problems to ${outPath}`);
