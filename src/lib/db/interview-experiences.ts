import { getSql } from "./client";

export type Difficulty = "easy" | "medium" | "hard";
export type Outcome    = "offer" | "rejection" | "ongoing" | "ghosted";

export interface InterviewExperience {
  id: number;
  user_id: number | null;
  company: string;
  role: string;
  difficulty: Difficulty;
  outcome: Outcome;
  rounds: string;
  tips: string | null;
  anonymous: boolean;
  approved: boolean;
  created_at: string;
  /** Display name — null when anonymous or user deleted */
  author_name: string | null;
  /** Net helpful votes (up minus down) */
  vote_score: number;
  /** User's own vote if known (+1 / -1 / null) */
  my_vote?: number | null;
}

/** Fetch all approved experiences for the public /interviews page. */
export async function getApprovedExperiences(opts: {
  company?: string;
  difficulty?: Difficulty;
  outcome?: Outcome;
  limit?: number;
  offset?: number;
  userId?: number | null;
  visitorId?: string | null;
}): Promise<InterviewExperience[]> {
  const sql = getSql();
  const { company, difficulty, outcome, limit = 30, offset = 0, userId = null, visitorId = null } = opts;

  const companyVal    = company    ?? null;
  const difficultyVal = difficulty ?? null;
  const outcomeVal    = outcome    ?? null;

  const rows = await sql`
    SELECT
      e.id, e.user_id, e.company, e.role, e.difficulty, e.outcome,
      e.rounds, e.tips, e.anonymous, e.approved, e.created_at,
      CASE WHEN e.anonymous THEN NULL ELSE u.name END AS author_name,
      COALESCE(SUM(v.vote), 0)::int AS vote_score,
      MAX(CASE
        WHEN ${userId}::int IS NOT NULL AND mv_user.user_id = ${userId}::int THEN mv_user.vote
        WHEN ${visitorId}::text IS NOT NULL AND mv_vis.visitor_id = ${visitorId}::text THEN mv_vis.vote
        ELSE NULL
      END)::int AS my_vote
    FROM interview_experiences e
    LEFT JOIN users u ON u.id = e.user_id
    LEFT JOIN interview_votes v ON v.experience_id = e.id
    LEFT JOIN interview_votes mv_user
      ON mv_user.experience_id = e.id
     AND ${userId}::int IS NOT NULL
     AND mv_user.user_id = ${userId}::int
    LEFT JOIN interview_votes mv_vis
      ON mv_vis.experience_id = e.id
     AND ${visitorId}::text IS NOT NULL
     AND mv_vis.visitor_id = ${visitorId}::text
    WHERE e.approved = true
      AND (${companyVal}::text    IS NULL OR lower(e.company) = lower(${companyVal}::text))
      AND (${difficultyVal}::text IS NULL OR e.difficulty     = ${difficultyVal}::text)
      AND (${outcomeVal}::text    IS NULL OR e.outcome        = ${outcomeVal}::text)
    GROUP BY e.id, u.name
    ORDER BY vote_score DESC, e.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as InterviewExperience[];
}

/** Total count for pagination. */
export async function countApprovedExperiences(opts: {
  company?: string;
  difficulty?: Difficulty;
  outcome?: Outcome;
}): Promise<number> {
  const sql = getSql();
  const { company, difficulty, outcome } = opts;
  const companyVal    = company    ?? null;
  const difficultyVal = difficulty ?? null;
  const outcomeVal    = outcome    ?? null;

  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM interview_experiences e
    WHERE e.approved = true
      AND (${companyVal}::text    IS NULL OR lower(e.company) = lower(${companyVal}::text))
      AND (${difficultyVal}::text IS NULL OR e.difficulty     = ${difficultyVal}::text)
      AND (${outcomeVal}::text    IS NULL OR e.outcome        = ${outcomeVal}::text)
  `;
  return (rows[0] as { n: number }).n;
}

/** Submit a new experience (starts unapproved). Returns new id. */
export async function submitExperience(data: {
  user_id: number | null;
  company: string;
  role: string;
  difficulty: Difficulty;
  outcome: Outcome;
  rounds: string;
  tips?: string;
  anonymous: boolean;
}): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO interview_experiences
      (user_id, company, role, difficulty, outcome, rounds, tips, anonymous)
    VALUES
      (${data.user_id}, ${data.company}, ${data.role}, ${data.difficulty},
       ${data.outcome}, ${data.rounds}, ${data.tips ?? null}, ${data.anonymous})
    RETURNING id
  `;
  return (rows[0] as { id: number }).id;
}

/** All experiences for admin moderation (pending first, then approved). */
export async function getAdminExperiences(): Promise<InterviewExperience[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      e.id, e.user_id, e.company, e.role, e.difficulty, e.outcome,
      e.rounds, e.tips, e.anonymous, e.approved, e.created_at,
      u.name AS author_name,
      COALESCE(SUM(v.vote), 0)::int AS vote_score
    FROM interview_experiences e
    LEFT JOIN users u ON u.id = e.user_id
    LEFT JOIN interview_votes v ON v.experience_id = e.id
    GROUP BY e.id, u.name
    ORDER BY e.approved ASC, e.created_at DESC
    LIMIT 500
  `;
  return rows as InterviewExperience[];
}

/** Approve or reject an experience. */
export async function setExperienceApproved(id: number, approved: boolean): Promise<void> {
  const sql = getSql();
  await sql`UPDATE interview_experiences SET approved = ${approved} WHERE id = ${id}`;
}

/** Delete an experience (admin only). */
export async function deleteExperience(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM interview_experiences WHERE id = ${id}`;
}

/** Upsert a vote. Passing vote=0 removes the vote. */
export async function voteOnExperience(
  experienceId: number,
  vote: 1 | -1 | 0,
  userId: number | null,
  visitorId: string | null,
): Promise<void> {
  const sql = getSql();

  if (vote === 0) {
    // Remove existing vote
    if (userId) {
      await sql`DELETE FROM interview_votes WHERE experience_id = ${experienceId} AND user_id = ${userId}`;
    } else if (visitorId) {
      await sql`DELETE FROM interview_votes WHERE experience_id = ${experienceId} AND visitor_id = ${visitorId}`;
    }
    return;
  }

  if (userId) {
    await sql`
      INSERT INTO interview_votes (experience_id, user_id, vote)
      VALUES (${experienceId}, ${userId}, ${vote})
      ON CONFLICT (experience_id, user_id)
      DO UPDATE SET vote = EXCLUDED.vote
    `;
  } else if (visitorId) {
    await sql`
      INSERT INTO interview_votes (experience_id, visitor_id, vote)
      VALUES (${experienceId}, ${visitorId}, ${vote})
      ON CONFLICT (experience_id, visitor_id)
      DO UPDATE SET vote = EXCLUDED.vote
    `;
  }
}
