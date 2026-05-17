/**
 * Replaces runtime DDL in src/lib/db/*.ts ensure* functions with no-ops.
 * Schema is owned by scripts/migrations — run `npm run migrate` on deploy.
 */
import fs from "fs";
import path from "path";

const dbDir = path.join(process.cwd(), "src/lib/db");
const files = fs.readdirSync(dbDir).filter((f) => f.endsWith(".ts") && f !== "client.ts" && f !== "types.ts" && f !== "index.ts");

for (const file of files) {
  const fp = path.join(dbDir, file);
  let src = fs.readFileSync(fp, "utf8");
  if (!src.includes("CREATE TABLE") && !src.includes("ALTER TABLE")) continue;

  // Replace async ensure* function bodies (single-level braces) with no-op
  src = src.replace(
    /async function (ensure[A-Za-z0-9_]+)\(\): Promise<void> \{[\s\S]*?\n\}/g,
    "async function $1(): Promise<void> {\n  /* schema via npm run migrate */\n}",
  );

  fs.writeFileSync(fp, src);
  console.log("noop:", file);
}

console.log("Done.");
