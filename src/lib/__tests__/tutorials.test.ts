import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs module
vi.mock("fs", () => ({
  default: {
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
  },
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

import fs from "fs";
import { getAllTutorials, getTutorialBySlug, getAdjacentTutorials } from "../tutorials";

const mockReaddirSync = vi.mocked(fs.readdirSync);
const mockReadFileSync = vi.mocked(fs.readFileSync);
const mockExistsSync = vi.mocked(fs.existsSync);

const makeMdx = (title: string, order: number, content = "") =>
  `---\ntitle: "${title}"\ndescription: "desc"\norder: ${order}\n---\n${content}`;

beforeEach(() => {
  vi.clearAllMocks();
  // getAllTutorials/getTutorialBySlug check existsSync(contentDir) — must return true
  mockExistsSync.mockReturnValue(true);
});

describe("getAllTutorials", () => {
  it("returns sorted tutorials by order", () => {
    mockReaddirSync.mockReturnValue(["b.mdx", "a.mdx"] as unknown as ReturnType<typeof fs.readdirSync>);
    mockReadFileSync
      .mockReturnValueOnce(makeMdx("Beta", 2))
      .mockReturnValueOnce(makeMdx("Alpha", 1));

    const result = getAllTutorials("go");
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("a");
    expect(result[0].title).toBe("Alpha");
    expect(result[1].slug).toBe("b");
  });

  it("extracts subtopics from ## headings", () => {
    mockReaddirSync.mockReturnValue(["test.mdx"] as unknown as ReturnType<typeof fs.readdirSync>);
    mockReadFileSync.mockReturnValue(
      makeMdx("Test", 1, "## Hello World\nsome text\n## `Code Example`\n")
    );

    const result = getAllTutorials("go");
    expect(result[0].subtopics).toHaveLength(2);
    expect(result[0].subtopics[0]).toEqual({ id: "hello-world", title: "Hello World" });
    expect(result[0].subtopics[1]).toEqual({ id: "code-example", title: "Code Example" });
  });

  it("filters non-mdx files", () => {
    mockReaddirSync.mockReturnValue(["a.mdx", "readme.md", "b.mdx"] as unknown as ReturnType<typeof fs.readdirSync>);
    mockReadFileSync
      .mockReturnValueOnce(makeMdx("A", 1))
      .mockReturnValueOnce(makeMdx("B", 2));

    const result = getAllTutorials("go");
    expect(result).toHaveLength(2);
  });
});

describe("getTutorialBySlug", () => {
  it("returns tutorial when found", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(makeMdx("Found", 1, "## Section\nbody"));

    const result = getTutorialBySlug("found", "go");
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Found");
    expect(result!.content).toContain("## Section");
  });

  it("returns null when not found", () => {
    mockExistsSync.mockReturnValue(false);
    const result = getTutorialBySlug("nonexistent", "go");
    expect(result).toBeNull();
  });
});

describe("getAdjacentTutorials", () => {
  beforeEach(() => {
    mockReaddirSync.mockReturnValue(["a.mdx", "b.mdx", "c.mdx"] as unknown as ReturnType<typeof fs.readdirSync>);
    mockReadFileSync
      .mockReturnValueOnce(makeMdx("A", 1))
      .mockReturnValueOnce(makeMdx("B", 2))
      .mockReturnValueOnce(makeMdx("C", 3));
  });

  it("returns prev and next for middle tutorial", () => {
    const { prev, next } = getAdjacentTutorials("b", "go");
    expect(prev?.slug).toBe("a");
    expect(next?.slug).toBe("c");
  });

  it("returns null prev for first tutorial", () => {
    const { prev, next } = getAdjacentTutorials("a", "go");
    expect(prev).toBeNull();
    expect(next?.slug).toBe("b");
  });

  it("returns null next for last tutorial", () => {
    const { prev, next } = getAdjacentTutorials("c", "go");
    expect(prev?.slug).toBe("b");
    expect(next).toBeNull();
  });
});
