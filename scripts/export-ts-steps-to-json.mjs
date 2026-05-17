/**
 * Export remaining TS tutorial steps to content/<lang>/<slug>.steps.json
 * when JSON does not yet exist.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const stepsRoot = path.join(root, "src/lib/tutorial-steps");

async function main() {
  const langs = fs.readdirSync(stepsRoot).filter((d) => {
    const p = path.join(stepsRoot, d);
    return fs.statSync(p).isDirectory();
  });

  let written = 0;
  for (const lang of langs) {
    const dir = path.join(stepsRoot, lang);
    const contentDir = path.join(root, "content", lang);
    if (!fs.existsSync(contentDir)) continue;

    const tsFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
    for (const file of tsFiles) {
      const slug = file.replace(/\.ts$/, "");
      const jsonPath = path.join(contentDir, `${slug}.steps.json`);
      if (fs.existsSync(jsonPath)) continue;

      const mod = await import(pathToFileURL(path.join(dir, file)).href);
      const steps = mod.steps ?? mod.default;
      if (!Array.isArray(steps) || steps.length === 0) {
        console.warn("skip (no steps):", lang, slug);
        continue;
      }

      fs.writeFileSync(jsonPath, JSON.stringify(steps, null, 2) + "\n");
      written++;
      console.log("wrote:", lang, slug);
    }
  }
  console.log(`Exported ${written} step files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
