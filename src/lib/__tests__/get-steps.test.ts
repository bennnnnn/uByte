import { describe, it, expect } from "vitest";
import { getSteps } from "@/lib/tutorial-steps";
import fs from "fs";
import path from "path";

describe("getSteps", () => {
  it("loads JavaScript getting-started from JSON with codeChecks flags", () => {
    const jsonPath = path.join(process.cwd(), "content/javascript/getting-started.steps.json");
    expect(fs.existsSync(jsonPath)).toBe(true);

    const steps = getSteps("javascript", "getting-started");
    expect(steps.length).toBeGreaterThan(7);

    const caseStep = steps[7];
    expect(caseStep?.title).toMatch(/case sensitivity/i);
    const check = caseStep?.codeChecks?.find((c) => c.message.includes("lowercase"));
    expect(check?.flags).toBe("m");
  });

  it("returns empty array for unknown slug", () => {
    expect(getSteps("go", "this-slug-does-not-exist-xyz")).toEqual([]);
  });
});
