# Database Audit Report: `/src/lib/db/`

**Audit Date:** March 7, 2025  
**Scope:** All files in `/src/lib/db/`, `client.ts`, `scripts/migrate.sql`, and related migrations

---

## Executive Summary

This audit identified **28 issues** across performance, correctness, and scalability. Key findings:

- **5 High** priority (race conditions, correctness bugs, unbounded queries)
- **12 Medium** priority (N+1 patterns, missing indexes, blocking operations)
- **11 Low** priority (minor optimizations, error handling)

---

## 1. Connection & Client

### `client.ts`

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 1-12 | No explicit connection pooling configuration | **Performance** | Neon serverless driver manages connections; document that connection limits are handled by Neon. Consider `neonConfig.fetchConnectionCache` for serverless if needed. | Low |
| 9 | `getSql()` throws if `DATABASE_URL` missing | **Correctness** | Acceptable; fails fast. Ensure all entry points catch and surface this clearly. | Low |

---

## 2. Users (`users.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 100-145 | **Race condition in `updateStreak`**: Read user → compute → write. Two concurrent requests can both read same state and overwrite each other. | **Correctness** | Wrap in a transaction with `SELECT ... FOR UPDATE` or use a single atomic SQL block (e.g. `UPDATE ... RETURNING` with streak logic in SQL). | **High** |
| 109 | `getUserById` called inside `updateStreak` — extra round-trip | **Performance** | Inline user fetch into the streak update or use a CTE. | Medium |
| 155-157 | **Read-then-write without transaction**: `incrementLoginFailure` does UPDATE then SELECT. Another process could increment between them. | **Correctness** | Use `UPDATE ... RETURNING failed_login_attempts` instead of separate SELECT. | **High** |
| 179-184 | Same pattern: UPDATE then SELECT for `incrementTokenVersion` | **Correctness** | Use `UPDATE ... RETURNING token_version`. | **High** |
| 237-244 | **Unbounded query**: `getUsersAtRiskOfLosingStreak` returns all matching users with no LIMIT | **Performance** | Add `LIMIT 500` (or similar) and document max batch size for cron. | Medium |
| 239 | Missing index: `WHERE streak_last_date = CURRENT_DATE - INTERVAL '1 day'` | **Performance** | Add `CREATE INDEX idx_users_streak_risk ON users(streak_last_date) WHERE streak_days > 0 AND email_verified = 1`. | Medium |
| 41, 52, 208 | `getUserByGoogleId`, `getUserByEmail`, `getUserByPaddleCustomerId` — `email` has UNIQUE, `google_id` and `stripe_customer_id` may not be indexed | **Performance** | Add `CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL` and `CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL`. | Medium |
| 79-82 | `sql.query()` with string interpolation — potential SQL injection if `sets`/`vals` are ever derived from user input | **Correctness** | Use parameterized tagged template; avoid raw `sql.query` with dynamic column names. | Medium |

---

## 3. Leaderboard (`leaderboard.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 16-17, 26-27 | **N+1-style subqueries**: For each user row, two correlated subqueries run (`SELECT COUNT(*) FROM progress`, `SELECT COUNT(*) FROM practice_attempts`). With 20 users = 40+ subquery executions. | **Performance** | Use JOINs with GROUP BY or lateral joins to compute counts in one pass. | **High** |
| 20, 29 | `ORDER BY u.xp DESC` on `users` — full table scan if no index | **Performance** | Add `CREATE INDEX idx_users_xp_desc ON users(xp DESC)` for leaderboard. | Medium |
| 20 | `last_active_at >= (NOW() - INTERVAL '7 days')::text` — comparing TEXT to timestamp | **Correctness** | Ensure `last_active_at` is stored as TIMESTAMPTZ or cast consistently. | Low |

---

## 4. Admin (`admin.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 7-14 | **Unbounded query**: `getAdminUsers` returns all users with no LIMIT or pagination | **Performance** | Add pagination (LIMIT/OFFSET or cursor) and a max cap (e.g. 1000). | **High** |
| 11-12 | **N+1 subqueries**: Two correlated subqueries per user (`completed_count`, `bookmark_count`) | **Performance** | Use LEFT JOIN + GROUP BY or lateral subqueries. | **High** |
| 48-49 | **Correctness bug**: Uses `r.vote` but `ratings` table has column `value` | **Correctness** | Change `r.vote` to `r.value`. | **High** |
| 44-54 | `getAdminTutorialAnalytics` — no LIMIT; full scan of progress + ratings | **Performance** | Add LIMIT for admin UI; consider materialized view for heavy analytics. | Medium |
| 357-361 | `getAdminExamStats` — four parallel full-table aggregations; acceptable for admin | **Performance** | Fine for admin; ensure indexes exist on `exam_attempts(submitted_at)`, `exam_certificates(lang)`. | Low |

---

## 5. Site Settings (`site-settings.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 16 | `SELECT key, value FROM site_settings` — unbounded but table is small (key-value) | **Performance** | Acceptable; site_settings is typically &lt;50 rows. | Low |
| 47-53 | **Loop with sequential queries**: `setSiteSettings` runs one INSERT per key in a loop | **Performance** | Use single batch INSERT with UNNEST or multiple rows in one statement. | Medium |

---

## 6. Site Banner (`site-banner.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 41-67 | **Sequential queries in loop**: Each `updates.*` field triggers a separate INSERT | **Performance** | Batch into one query with multiple VALUES or use a transaction + single multi-row upsert. | Medium |

---

## 7. Exam Settings (`exam-settings.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 165-184 | **N+1 in `setExamConfigInSiteSettingsBulk`**: For each lang in `EXAM_LANGS`, 3 sequential INSERTs | **Performance** | Batch all (lang, key, value) into one INSERT with UNNEST. | Medium |
| 221-226 | **Loop calling `setExamSettingsForLang`**: Each language = multiple DB round-trips | **Performance** | Refactor to bulk update. | Medium |

---

## 8. Exam Questions (`exam-questions.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 17-18 | `getQuestionIdsByLang` — returns all IDs for a language with no LIMIT | **Performance** | Caller samples 40; consider adding LIMIT in DB or document that caller must limit. Table may grow large. | Medium |
| 90-121 | **N+1 in `insertExamQuestions`**: One INSERT per row in a loop | **Performance** | Use batch INSERT with UNNEST or multi-row VALUES. | **High** |

---

## 9. Exam Attempts (`exam-attempts.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 67-75 | `lockAttemptForSubmit` — good use of atomic UPDATE with `WHERE submitted_at IS NULL` | — | No change. | — |
| 117-119 | `getAnswers` — no LIMIT; bounded by attempt’s question count (e.g. 40) | **Performance** | Acceptable. | Low |
| 144-154 | `getExamPublicStatsByLang` — aggregates all submitted attempts; no LIMIT on GROUP BY result | **Performance** | Fine; result set is small (one row per lang). | Low |

---

## 10. Passwords (`passwords.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 12-13 | **Non-atomic**: UPDATE to mark old tokens used, then INSERT. Another request could insert between them. | **Correctness** | Use a transaction or single statement (e.g. CTE). | Medium |
| 23 | `(token = ${tokenHash} OR token = ${token})` — plaintext token fallback for backwards compat; ensure no security regression | **Correctness** | Document; consider deprecating plaintext fallback. | Low |

---

## 11. Rate Limit (`rate-limit.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 12-28 | **Three sequential queries**: DELETE expired, SELECT count, INSERT. Race: two requests can both pass count check before either inserts. | **Correctness** | Use advisory lock or single atomic upsert/count. | Medium |
| 12 | DELETE can lock many rows if `rate_limits` grows large | **Performance** | Add LIMIT to DELETE or run cleanup in background. | Low |

---

## 12. Practice Attempts (`practice-attempts.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 39-51 | **Read-then-write race**: SELECT status, then INSERT/UPDATE. Two concurrent requests can both get `wasFirstSolve: true`. | **Correctness** | Use `INSERT ... ON CONFLICT ... RETURNING` with conditional logic, or `UPDATE ... RETURNING` to detect first solve atomically. | **High** |

---

## 13. Snapshots (`snapshots.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 43-51 | **Subquery in DELETE**: `DELETE ... WHERE id IN (SELECT id ... ORDER BY saved_at DESC OFFSET 5)` — PostgreSQL allows this but the subquery may not be optimized | **Performance** | Use `DELETE FROM code_snapshots WHERE id IN (SELECT id FROM ...)` — ensure index on `(user_id, slug, step_index, language)`. Index exists. | Low |
| 46 | `(language = ${language} OR language IS NULL)` — may prevent index use | **Performance** | Prefer `language = ${language}` if NULL is rare; or add partial index. | Low |

---

## 14. Submissions (`submissions.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 88-92 | `getConsecutiveFailures` — LIMIT 10, good | — | No change. | — |
| 88 | Index `idx_submissions_user_problem` exists (migration 002); `ORDER BY created_at DESC` benefits from `idx_submissions_created` | **Performance** | Consider composite index `(user_id, problem_id, created_at DESC)` for this query. | Low |

---

## 15. Activity (`activity.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 15 | `getActivityCount` — full count with no LIMIT; can be slow for very active users | **Performance** | Add `CREATE INDEX idx_activity_log_user ON activity_log(user_id)` if missing. | Medium |
| 10 | `logActivity` — unbounded inserts; table can grow large | **Performance** | Consider TTL/archival or partitioning for old activity. | Low |

---

## 16. Progress (`progress.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 105-114 | `resetAllProgress` — multiple DELETEs and UPDATE not in a transaction | **Correctness** | Wrap in transaction so partial failure doesn’t leave inconsistent state. | Medium |
| 127 | `getPageViewCount` — full count per visitor | **Performance** | Add index on `page_views(visitor_id)` if missing. UNIQUE(visitor_id, page_slug) may help. | Low |

---

## 17. Ratings (`ratings.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 26-40 | **Two queries** for `getTutorialRating`: one for aggregate, one for user vote when `userId` provided | **Performance** | Combine into one query with conditional aggregation or use a single query with FILTER. | Medium |
| 30 | `(language = ${language} OR language IS NULL)` — may prevent index use | **Performance** | Add composite index on `(tutorial_slug, language)` or `(tutorial_slug, user_id, language)`. | Low |

---

## 18. Home Popular (`home-popular.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 35-41, 68-74 | `getPopularLanguages`, `getPopularTutorials` — use LIMIT; good | — | No change. | — |
| 77-94 | **In-memory loop over DB rows**: For each row, calls `getAllTutorials(lang)` and `tutorials.find()` — not DB N+1 but CPU work in loop | **Performance** | Pre-fetch tutorials once; build a map by lang/slug. | Low |

---

## 19. AI Usage (`ai-usage.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 30-31 | `canMakeAiCall` calls `getTodayAiUsageCount` then returns — two round-trips when one would suffice | **Performance** | Inline the count query into `canMakeAiCall`. | Low |
| 56-58 | `isInCooldown` calls `getLastAiCallAt` — extra round-trip | **Performance** | Combine with caller if both are needed in same request. | Low |

---

## 20. Achievements (`achievements.ts`)

| Line | Issue | Impact | Fix | Priority |
|------|-------|--------|-----|----------|
| 21 | `unlockAchievement` catches all errors and returns false — hides real DB errors | **Correctness** | Only catch conflict (duplicate key); rethrow others. | Medium |

---

## 21. Error Handling (General)

| File(s) | Issue | Impact | Fix | Priority |
|---------|-------|--------|-----|----------|
| Multiple | Many functions let errors propagate; no retry for transient failures | **Correctness** | Add retry with backoff for connection/timeout errors where appropriate. | Low |
| `exam-settings.ts`, `site-banner.ts` | `catch { return DEFAULT }` — swallows errors | **Correctness** | Log errors; consider partial fallback instead of silent default. | Low |

---

## 22. Schema & Indexes (`migrate.sql` + migrations)

### Missing indexes (recommended)

| Table | Columns | Reason |
|-------|---------|--------|
| `users` | `(google_id)` WHERE google_id IS NOT NULL | `getUserByGoogleId` |
| `users` | `(stripe_customer_id)` WHERE stripe_customer_id IS NOT NULL | `getUserByPaddleCustomerId` |
| `users` | `(xp DESC)` | Leaderboard `ORDER BY xp DESC` |
| `users` | `(streak_last_date)` WHERE streak_days > 0 | `getUsersAtRiskOfLosingStreak` |
| `activity_log` | `(user_id)` | `getActivityCount`, `getRecentActivity` |
| `ratings` | `(tutorial_slug, language)` or `(tutorial_slug, user_id, language)` | `getTutorialRating` |
| `submissions` | `(user_id, problem_id, created_at DESC)` | `getConsecutiveFailures` |

### Existing indexes (from migrations)

- `rate_limits(key, hit_at)` ✓
- `practice_views(problem_slug)` ✓
- `exam_questions(lang)` ✓
- `exam_attempts(user_id)`, `(user_id, lang)` ✓
- `exam_attempts(lang, submitted_at)` WHERE submitted_at IS NOT NULL ✓
- `exam_answers(attempt_id)` ✓
- `exam_certificates(user_id)` ✓
- `submissions(user_id, problem_id)`, `(created_at)` ✓
- `ai_feedback_responses(problem_id, language, code_hash, ...)` ✓

---

## Summary by Priority

### High (5)

1. **users.ts:100-145** — Race condition in `updateStreak`
2. **users.ts:155-157, 179-184** — Read-then-write without transaction in login/token
3. **admin.ts:7-14** — Unbounded `getAdminUsers` + N+1 subqueries
4. **admin.ts:48-49** — Wrong column `r.vote` → `r.value`
5. **leaderboard.ts:16-27** — N+1 correlated subqueries
6. **exam-questions.ts:90-121** — N+1 INSERT loop
7. **practice-attempts.ts:39-51** — Race in `savePracticeAttempt` (wasFirstSolve)

### Medium (12)

- users.ts: extra round-trip in updateStreak, unbounded getUsersAtRiskOfLosingStreak, missing indexes
- site-settings.ts, site-banner.ts, exam-settings.ts: loop-based sequential queries
- passwords.ts: non-atomic token invalidation
- rate-limit.ts: race in check + insert
- progress.ts: resetAllProgress not in transaction
- activity.ts: missing index
- ratings.ts: two queries for getTutorialRating
- achievements.ts: error swallowing

### Low (11)

- client.ts: connection pooling docs
- users.ts: sql.query injection risk, index recommendations
- leaderboard.ts: last_active_at type
- snapshots.ts, submissions.ts: minor index tweaks
- activity.ts, ai-usage.ts: small optimizations
- General: error handling, logging

---

## Recommended Action Order

1. Fix **admin.ts:48-49** (`r.vote` → `r.value`) — immediate correctness fix.
2. Add **transactions** for `updateStreak`, `incrementLoginFailure`, `incrementTokenVersion`, `resetAllProgress`, `createPasswordResetToken`, `savePracticeAttempt`.
3. Add **pagination** to `getAdminUsers` and **LIMIT** to `getUsersAtRiskOfLosingStreak`.
4. Refactor **leaderboard** and **admin** to remove N+1 subqueries.
5. Batch **exam-questions insert** and **site-settings/site-banner** updates.
6. Add **missing indexes** per table above.
7. Improve **error handling** in achievements and exam-settings fallbacks.
