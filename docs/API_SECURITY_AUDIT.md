# API Security Audit Report

**Date:** March 6, 2025  
**Scope:** All API routes in `/src/app/api/` (auth, profile, admin, submit, run-code, judge-code, chat, code-feedback, ai-feedback, billing, step-check, practice-attempt, practice-view, views, notifications, profile/activity)

---

## Summary Table

| Route | Method | Auth | CSRF | Rate Limit | Input Validation | Issues Found |
|-------|--------|------|------|------------|------------------|--------------|
| `/api/auth/login` | POST | N/A | N/A* | ✅ 5/min | Partial | No email format/length validation; login CSRF possible |
| `/api/auth/signup` | POST | N/A | N/A* | ✅ 3/min | Partial | Email enumeration (409); no name/email length limits |
| `/api/auth/logout` | POST | N/A | ✅ | N/A | N/A | None |
| `/api/auth/logout-all` | POST | ✅ | ✅ | N/A | N/A | `verifyCsrf` used with `await` (sync fn) — harmless |
| `/api/auth/me` | GET | Optional | N/A | N/A | N/A | None |
| `/api/auth/forgot-password` | POST | N/A | N/A* | ✅ 3/min | Partial | No email format validation; good: no email enumeration |
| `/api/auth/reset-password` | POST | N/A | N/A* | ✅ 5/min | ✅ | None |
| `/api/auth/verify-email` | GET | N/A | N/A | ❌ | Minimal | No rate limit; token enum possible (low risk) |
| `/api/auth/resend-verification` | POST | ✅ | ❌ | ✅ 3/5min | N/A | **Missing CSRF** |
| `/api/auth/google` | GET | N/A | N/A | N/A | N/A | OAuth flow — state param used |
| `/api/auth/google/callback` | GET | N/A | N/A | N/A | N/A | State validated; no rate limit on callback |
| `/api/profile` | GET | ✅ | N/A | N/A | N/A | None |
| `/api/profile` | PUT | ✅ | ✅ | ✅ | Partial | name length not capped; bio capped at 200 |
| `/api/profile` | DELETE | ✅ | ✅ | N/A | N/A | None |
| `/api/admin/users` | GET | ✅ Admin | N/A | N/A | slug validated | None |
| `/api/admin/users` | POST | ✅ Admin | ✅ | N/A | Partial | action/userId validated; userId type coercion risk |
| `/api/submit` | POST | Optional | ❌ | ✅ 10/min | Partial | **Missing CSRF**; no code length limit; anonymous OK |
| `/api/run-code` | POST | N/A | ❌ | ✅ 15/min | ✅ | **Missing CSRF**; public — acceptable for sandbox |
| `/api/judge-code` | POST | N/A | ❌ | ✅ 10/min | Partial | **Missing CSRF**; no code length limit |
| `/api/chat` | GET | N/A | N/A | N/A | slug required | Public read — by design |
| `/api/chat` | POST | ✅ | ✅ | ❌ | Partial | **Missing rate limit**; content truncated 2000 |
| `/api/code-feedback` | POST | N/A | ❌ | ✅ 30/min | Partial | **Missing CSRF**; public AI endpoint; code/error truncated |
| `/api/ai-feedback` | POST | ✅ | ❌ | Via quota | ✅ | **Missing CSRF**; quota/cooldown present |
| `/api/billing/checkout` | POST | ✅ | ✅ | N/A | ✅ Zod | None |
| `/api/step-check` | POST | N/A | ❌ | ✅ 60/min | ✅ | **Missing CSRF**; anonymous analytics — low risk |
| `/api/practice-attempt` | GET | Optional | N/A | N/A | N/A | None |
| `/api/practice-attempt` | POST | ✅ | ❌ | N/A | ✅ | **Missing CSRF** |
| `/api/practice-view` | POST | N/A | ❌ | ❌ | Partial | **Missing CSRF, rate limit**; slug validated |
| `/api/views` | GET | Optional | N/A | N/A | N/A | None |
| `/api/views` | POST | N/A | ❌ | ❌ | Partial | **Missing CSRF, rate limit**; slug validated |
| `/api/notifications` | GET | ✅ | N/A | N/A | N/A | None |
| `/api/notifications` | PATCH | ✅ | ❌ | N/A | N/A | **Missing CSRF** |
| `/api/profile/activity` | GET | ✅ | N/A | N/A | N/A | None |
| `/api/profile/activity` | POST | ✅ | ❌ | N/A | Partial | **Missing CSRF**; action/detail not validated (length, allowlist) |

\* N/A for CSRF on login/signup/forgot-password/reset-password: No session exists yet; traditional CSRF token not applicable. Login CSRF (victim logged in as attacker) is still possible with SameSite=Lax.

---

## Security Infrastructure Review

### `src/lib/auth.ts`
- JWT in httpOnly cookie, HS256
- Token version checked against DB for logout-all invalidation
- `getCurrentUser()` validates token and version
- **Note:** Dev fallback secret when `JWT_SECRET` unset — ensure production has it

### `src/lib/csrf.ts`
- UUID token in non-httpOnly cookie (JS-readable for `x-csrf-token` header)
- `verifyCsrf(request)` compares cookie vs header
- **Bug:** `logout-all` uses `await verifyCsrf(request)` — `verifyCsrf` is synchronous; works but redundant

### `src/lib/rate-limit.ts`
- DB-backed rate limiting (persists across restarts)
- Fail-closed on DB error
- `getClientIp()` from `x-forwarded-for` / `x-real-ip`

### `src/lib/api-utils.ts`
- `withErrorHandling` — catches errors, returns 500 with requestId
- `requireAuth()` — 401 if no user
- `requireAdmin()` — 401/403 if not admin

### `src/lib/api-client.ts`
- Client-side fetch wrapper adds `x-csrf-token` for non-GET/HEAD
- Uses `credentials: "same-origin"`

### Middleware
- **No `middleware.ts` found** — no global auth or CSRF enforcement

---

## Detailed Findings

### 1. Missing CSRF on Mutations (High Priority)

These authenticated mutation routes do not call `verifyCsrf(request)`:

| Route | Risk |
|-------|------|
| `POST /api/auth/resend-verification` | Attacker could trigger verification emails for victim |
| `POST /api/submit` | Anonymous; CSRF could submit code as victim if they're logged in |
| `POST /api/run-code` | Public; low impact |
| `POST /api/judge-code` | Same as submit |
| `POST /api/code-feedback` | Public; low impact |
| `POST /api/ai-feedback` | Attacker could consume victim's AI quota |
| `POST /api/step-check` | Anonymous analytics; low impact |
| `POST /api/practice-attempt` | Attacker could record fake attempts, consume XP |
| `POST /api/practice-view` | Analytics; low impact |
| `POST /api/views` | Analytics; low impact |
| `PATCH /api/notifications` | Attacker could mark victim's notifications read |
| `POST /api/profile/activity` | Attacker could inject arbitrary activity/detail |

**Recommendation:** Add `verifyCsrf(request)` at the start of all mutation handlers that require or use auth, and for any mutation that modifies user state.

---

### 2. Missing Rate Limiting

| Route | Concern |
|-------|---------|
| `GET /api/auth/verify-email` | Token enumeration (tokens are 32-byte hex — low risk, but rate limit still advisable) |
| `POST /api/chat` | AI calls; expensive; no rate limit beyond IP |
| `POST /api/practice-view` | Could be spammed to skew popularity |
| `POST /api/views` | Could be spammed to inflate view counts |
| `GET /api/admin/users` | Admin export; consider rate limit |
| `POST /api/admin/users` | Admin actions; consider rate limit |

**Recommendation:** Add rate limits to chat (e.g., 20/min per user), practice-view and views (e.g., 100/min per IP), and verify-email (e.g., 10/min per IP).

---

### 3. Input Validation Gaps

| Route | Field | Issue |
|-------|-------|-------|
| `POST /api/auth/login` | email, password | No format/length validation; very long strings could cause issues |
| `POST /api/auth/signup` | name, email | No length limits; name could be huge |
| `POST /api/submit` | code | No explicit length limit (Judge0 may have its own) |
| `POST /api/judge-code` | code | No length limit |
| `POST /api/profile/activity` | action, detail | No allowlist for action; no length limit for detail — could store large strings |
| `POST /api/admin/users` | userId | `Number(body.userId)` — NaN could pass through; validate `Number.isInteger(userId)` |

**Recommendation:** Add Zod or similar validation: email format, string lengths (e.g., name ≤ 100, bio ≤ 200, code ≤ 64KB), and allowlist for `action` in activity.

---

### 4. Information Leaks

| Route | Leak |
|-------|------|
| `POST /api/auth/signup` | Returns 409 "Email already registered" — reveals email existence |
| `POST /api/auth/login` | Uses generic "Invalid email or password" — good |
| `POST /api/auth/forgot-password` | Always returns 200 — good |

**Recommendation:** For signup, consider returning a generic "Registration failed" or delaying response to reduce enumeration. Alternatively, accept the tradeoff for UX (users need to know if email is taken).

---

### 5. SQL Injection

- **Risk: Low.** All DB access uses `postgres` (or similar) tagged template literals with parameterized queries. User input is passed as parameters, not concatenated into SQL.

---

### 6. Auth Consistency

- `requireAuth()` vs `getCurrentUser()`: Routes correctly use `requireAuth()` when auth is required, and `getCurrentUser()` when optional (e.g., submit, practice-attempt GET, views).
- Admin routes use `requireAdmin()` — correct.

---

## Recommendations Summary

1. **Add CSRF verification** to all mutation routes that use or require auth: resend-verification, submit (when user present), ai-feedback, practice-attempt, notifications PATCH, profile/activity POST.
2. **Add rate limiting** to: verify-email, chat POST, practice-view, views POST.
3. **Tighten input validation**: email format, string lengths, activity action allowlist, admin userId as integer.
4. **Consider** generic signup error to reduce email enumeration (optional).
5. **Add code length limits** to submit and judge-code (e.g., 64KB) if not enforced by Judge0.
6. **Validate `action` and `detail`** in profile/activity: allowlist known actions, cap detail length (e.g., 500 chars).

---

## Routes with No Issues

- `GET/POST /api/auth/logout` — CSRF present
- `POST /api/auth/logout-all` — Auth + CSRF
- `GET /api/auth/me` — Read-only
- `POST /api/auth/reset-password` — Rate limit, validation, no enumeration
- `GET/PUT/DELETE /api/profile` — Auth, CSRF on mutations, rate limit on PUT
- `GET/POST /api/admin/users` — Admin auth, CSRF on POST
- `POST /api/billing/checkout` — Auth, CSRF, Zod validation
- `GET /api/notifications` — Auth
- `GET /api/profile/activity` — Auth
