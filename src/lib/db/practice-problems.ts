/**
 * DB access layer for practice_problems.
 *
 * Problems are stored as rows with JSONB columns for nested data (examples,
 * starter code, test cases, judge harness). This replaces the previous pattern
 * of importing all ~114 problems as in-memory TypeScript objects on every request.
 *
 * Seeding: run `npm run seed:problems` to populate from the TS source files.
 * Admin CRUD is exposed via /api/admin/practice-problems.
 */

import { getSql } from "./client";
import type { PracticeProblem } from "@/lib/practice/types";

type DbRow = {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  category: string | null;
  description: string;
  examples: unknown;
  starter: unknown;
  test_cases: unknown;
  judge_harness: unknown;
};

function rowToProblem(row: DbRow): PracticeProblem {
  return {
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty as PracticeProblem["difficulty"],
    category: (row.category ?? undefined) as PracticeProblem["category"],
    description: row.description,
    examples: (row.examples as PracticeProblem["examples"]) ?? [],
    starter: (row.starter as PracticeProblem["starter"]) ?? {},
    testCases: (row.test_cases as PracticeProblem["testCases"]) ?? [],
    judgeHarness: (row.judge_harness as PracticeProblem["judgeHarness"]) ?? {},
  };
}

export async function getAllPracticeProblemsFromDb(): Promise<PracticeProblem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, slug, title, difficulty, category, description, examples, starter, test_cases, judge_harness
    FROM practice_problems
    ORDER BY
      CASE difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      category NULLS LAST,
      title
  `;
  return (rows as DbRow[]).map(rowToProblem);
}

export async function getPracticeProblemsCount(): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM practice_problems`;
  return (row?.c as number) ?? 0;
}

export async function getPracticeProblemBySlugFromDb(slug: string): Promise<PracticeProblem | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, slug, title, difficulty, category, description, examples, starter, test_cases, judge_harness
    FROM practice_problems
    WHERE slug = ${slug}
  `;
  if (!row) return null;
  return rowToProblem(row as DbRow);
}

export async function getPracticeProblemsPage(
  limit: number,
  offset: number,
  filters?: { difficulty?: string; category?: string }
): Promise<{ problems: PracticeProblem[]; total: number }> {
  const sql = getSql();

  const diffFilter = filters?.difficulty ?? null;
  const catFilter = filters?.category ?? null;

  const rows = await sql`
    SELECT id, slug, title, difficulty, category, description, examples, starter, test_cases, judge_harness
    FROM practice_problems
    WHERE
      (${diffFilter}::text IS NULL OR difficulty = ${diffFilter})
      AND (${catFilter}::text IS NULL OR category = ${catFilter})
    ORDER BY
      CASE difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      category NULLS LAST,
      title
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [countRow] = await sql`
    SELECT COUNT(*)::int AS c FROM practice_problems
    WHERE
      (${diffFilter}::text IS NULL OR difficulty = ${diffFilter})
      AND (${catFilter}::text IS NULL OR category = ${catFilter})
  `;

  return {
    problems: (rows as DbRow[]).map(rowToProblem),
    total: (countRow?.c as number) ?? 0,
  };
}

export async function upsertPracticeProblem(problem: PracticeProblem): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO practice_problems (slug, title, difficulty, category, description, examples, starter, test_cases, judge_harness)
    VALUES (
      ${problem.slug},
      ${problem.title},
      ${problem.difficulty},
      ${problem.category ?? null},
      ${problem.description},
      ${JSON.stringify(problem.examples ?? [])}::jsonb,
      ${JSON.stringify(problem.starter ?? {})}::jsonb,
      ${JSON.stringify(problem.testCases ?? [])}::jsonb,
      ${JSON.stringify(problem.judgeHarness ?? {})}::jsonb
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
  `;
}

export async function deletePracticeProblem(slug: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`DELETE FROM practice_problems WHERE slug = ${slug} RETURNING id`;
  return rows.length > 0;
}
