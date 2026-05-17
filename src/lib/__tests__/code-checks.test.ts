import { describe, it, expect } from "vitest";
import { runCodeChecks, checkOutput, todoNotCompleted } from "../code-checks";
import type { CodeCheck } from "@/lib/tutorial-steps/types";

describe("runCodeChecks", () => {
  const caseSensitivityCheck: CodeCheck = {
    pattern: "Console\\.log|console\\.Log",
    flags: "m",
    required: false,
    message: "Use lowercase: console.log — JavaScript is case-sensitive!",
  };

  it("allows correct lowercase console.log", () => {
    const code = 'console.log("Hello!");\nconsole.log("World!");';
    expect(runCodeChecks(code, [caseSensitivityCheck])).toBeNull();
  });

  it("rejects Console.log with case-sensitive flags", () => {
    const code = 'Console.log("Hello!");';
    expect(runCodeChecks(code, [caseSensitivityCheck])).toBe(caseSensitivityCheck.message);
  });

  it("false-positives with default im flags (regression)", () => {
    const badDefault: CodeCheck = {
      ...caseSensitivityCheck,
      flags: undefined,
    };
    const code = 'console.log("Hello!");';
    expect(runCodeChecks(code, [badDefault])).toBe(badDefault.message);
  });

  it("requires pattern when required is true", () => {
    const check: CodeCheck = {
      pattern: "console\\.log",
      required: true,
      message: "Use console.log",
    };
    expect(runCodeChecks("print('x')", [check])).toBe("Use console.log");
    expect(runCodeChecks('console.log("x")', [check])).toBeNull();
  });
});

describe("checkOutput", () => {
  it("matches expected substrings case-insensitively", () => {
    expect(checkOutput("Hello!\nWorld!", ["hello", "world"])).toBe(true);
    expect(checkOutput("", ["x"])).toBe(false);
  });

  it("passes when expected is empty and output is non-empty", () => {
    expect(checkOutput("anything", [])).toBe(true);
  });
});

describe("todoNotCompleted", () => {
  it("detects unchanged starter with TODO", () => {
    const starter = "// TODO: fix\nconsole.log(1);";
    expect(todoNotCompleted(starter, starter)).toBe(true);
    expect(todoNotCompleted("console.log(2);", starter)).toBe(false);
  });
});
