# Security Audit: Auth System & Sensitive Flows

**Date:** March 7, 2025  
**Scope:** Authentication, authorization, CSRF, rate limiting, OAuth, webhooks, password flows, admin routes

---

## Executive Summary

The uByte auth system has a solid foundation (JWT with token versioning, bcrypt, CSRF on mutations, OAuth state validation) but contains **3 critical**, **4 high**, and several medium/low severity issues that should be addressed.

---

## Critical Vulnerabilities

### 1. Rate Limit Bypass via Spoofed IP Headers

**Severity:** Critical  
**Files:** `src/lib/rate-limit.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/signup/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`

**Issue:** Rate limiting uses `getClientIp()` which reads `x-forwarded-for` or `x-real-ip`. These headers are **client-controllable**. An attacker can bypass rate limits by rotating spoofed IPs.

```typescript
// rate-limit.ts - vulnerable
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
```

**Exploit scenario:** Attacker performs brute-force login attempts by sending `X-Forwarded-For: 1.2.3.4`, `X-Forwarded-For: 1.2.3.5`, etc. Each appears as a different "client," bypassing the 5-attempt-per-minute limit.

**Fix:**
- Only trust `x-forwarded-for` / `x-real-ip` when the request comes from a trusted reverse proxy (e.g., Vercel, Cloudflare). Use `request.ip` or equivalent from your hosting provider when available.
- Add a fallback that uses a hash of the auth cookie or a fingerprint when behind a trusted proxy.
- Consider requiring the proxy to sign or strip client-supplied headers and only append the real IP server-side.

---

### 2. Paddle Webhook Trusts Client-Supplied `userId`

**Severity:** Critical  
**Files:** `src/app/api/webhooks/paddle/route.ts`, `src/components/profile/PlanTab.tsx`, `src/app/pricing/page.tsx`

**Issue:** For `subscription.activated`, the webhook uses `custom_data.userId` from the event. This value is set by the **client** when initiating Paddle checkout. A malicious user can modify the Paddle checkout request to pass any `userId`.

```typescript
// PlanTab.tsx - client sets userId
customData: user ? { userId: String(user.id) } : undefined,
```

```typescript
// webhooks/paddle/route.ts - trusts client data
const userId = customData?.["userId"];
if (userId && paddleCustomerId) {
  const uid = parseInt(userId, 10);
  await updateUserPlan(uid, activatedPlan, paddleCustomerId);
```

**Exploit scenario:** Attacker pays for a subscription, intercepts or modifies the Paddle checkout to pass `custom_data: { userId: "12345" }` (victim's ID). Victim gets Pro for free; attacker paid but could also use this to gift subscriptions or abuse the system.

**Fix:**
- Create a server-side "pending checkout" record when the user initiates checkout. Store `userId` server-side keyed by a nonce or session ID.
- Pass only the nonce/session ID in `custom_data`. In the webhook, look up the pending record to get the real `userId`.
- Alternatively, after `subscription.activated`, verify that the Paddle `customer_id` email matches the user's email before applying the plan.

---

### 3. Webhook HMAC Comparison Not Timing-Safe

**Severity:** Critical (in theory; practical exploit requires many requests)  
**File:** `src/app/api/webhooks/paddle/route.ts`

**Issue:** The signature comparison uses `===`, which short-circuits on the first differing byte. An attacker could use timing measurements to brute-force the signature.

```typescript
return expected === h1;  // NOT timing-safe
```

**Fix:** Use constant-time comparison:

```typescript
import { timingSafeEqual } from "crypto";

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
return secureCompare(expected, h1);
```

---

## High Severity

### 4. Login/Signup Missing CSRF Protection

**Severity:** High  
**Files:** `src/app/api/auth/login/route.ts`, `src/app/api/auth/signup/route.ts`

**Issue:** Login and signup do not verify CSRF tokens. Other mutation endpoints (profile, logout, admin) use `verifyCsrf(request)`.

**Exploit scenario:** Attacker creates a page that auto-submits a form to `/api/auth/login` with the attacker's credentials. A victim visiting the page gets logged into the attacker's account. The attacker can then log in and observe the victim's activity or perform actions as the victim within that account.

**Fix:** Set a CSRF cookie when serving the login/signup page (e.g., via `/api/auth/me` or a dedicated endpoint) and verify it on login/signup POST. The app already backfills CSRF via `/api/auth/me` for unauthenticated users—ensure the login form uses `apiFetch` (which sends the CSRF header) and add `verifyCsrf(request)` at the start of the login and signup handlers.

---

### 5. Password Change Does Not Invalidate Other Sessions

**Severity:** High  
**File:** `src/app/api/profile/route.ts`

**Issue:** When a user changes their password via the profile form, `updateUserPassword` is called but `incrementTokenVersion` is not. Existing sessions (including potentially stolen ones) remain valid until they expire (30 days).

**Exploit scenario:** Attacker obtains a session cookie (e.g., via a past breach or MITM). Victim changes their password. Attacker's session is still valid.

**Fix:** After `updateUserPassword`, call `incrementTokenVersion(userId)` and optionally re-sign the token for the current request so the user doesn't get logged out immediately.

---

### 6. Logout Does Not Invalidate Token Server-Side

**Severity:** High  
**File:** `src/app/api/auth/logout/route.ts`

**Issue:** Logout only clears the auth cookie. It does not increment `token_version`. A stolen token remains valid until it expires.

**Exploit scenario:** Attacker steals a JWT (e.g., via a compromised device or network). Victim logs out. Attacker can still use the token until it expires (30 days).

**Fix:** Call `incrementTokenVersion(userId)` before `clearAuthCookie()` so all existing tokens are invalidated. This matches the behavior of `logout-all`.

---

### 7. Admin POST CSRF Check Before Auth (Order Bug)

**Severity:** Low (informational)  
**File:** `src/app/api/admin/users/route.ts`

**Issue:** The handler checks CSRF before `requireAdmin`. If CSRF fails, it returns 403 before verifying admin status. This is actually correct (fail fast), but `await verifyCsrf(request)` is redundant—`verifyCsrf` is synchronous. Minor consistency issue.

---

## Medium Severity

### 8. Password Reset Token Lookup Allows Plaintext Fallback

**Severity:** Medium (defense in depth)  
**File:** `src/lib/db/passwords.ts`

**Issue:** The query uses `(token = ${tokenHash} OR token = ${token})`. The second clause compares the stored hash to the raw token, which can never match. It appears to be dead code, possibly from a migration. If there were any legacy plaintext tokens (there shouldn't be), this could weaken security.

```typescript
WHERE (token = ${tokenHash} OR token = ${token}) AND used = 0 AND expires_at::timestamptz > NOW()
```

**Fix:** Remove the `OR token = ${token}` clause. Only compare hashes.

---

### 9. Same Pattern in Email Verification

**Severity:** Medium  
**File:** `src/lib/db/users.ts`

**Issue:** `verifyEmail` uses `(email_verification_token = ${tokenHash} OR email_verification_token = ${token})`. Same dead-code pattern as password reset.

**Fix:** Remove the `OR email_verification_token = ${token}` clause.

---

### 10. Password Policy Inconsistency

**Severity:** Medium  
**Files:** `src/lib/password-policy.ts`, `src/app/api/profile/route.ts`

**Issue:** `password-policy.ts` defines `MIN_PASSWORD_LENGTH = 6` and the policy message says "at least 6 characters." The profile route's inline check uses `body.newPassword.length < 8`:

```typescript
if (typeof body.newPassword !== "string" || body.newPassword.length < 8) {
  return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
}
```

So signup/reset allow 6+ chars, but profile password change requires 8+. Inconsistent and confusing.

**Fix:** Use `isValidPassword(body.newPassword)` (and ensure `MIN_PASSWORD_LENGTH` is at least 8 for stronger security) everywhere, and remove the inline length check.

---

### 11. Account Lock Message Enables User Enumeration

**Severity:** Medium  
**File:** `src/app/api/auth/login/route.ts`

**Issue:** When an account is locked, the response is distinct: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes." (423). For a non-existent email, the response is "Invalid email or password" (401). An attacker can enumerate valid emails by triggering lockouts.

**Fix:** Return the same generic message for both cases: "Invalid email or password" or "Too many attempts. Try again later." Use 429 for rate limiting and 401 for invalid credentials; avoid revealing lock status.

---

### 12. Open Redirect via `next` Parameter

**Severity:** Medium  
**File:** `src/lib/auth-redirect.ts`

**Issue:** `getSafeNextPath` blocks paths starting with `//` but may not block all open-redirect vectors (e.g., `/%2f%2fevil.com`, `/\t`, or other encoded forms). The check `value.startsWith("//")` may miss some browser normalization.

**Fix:** Use an allowlist of known safe paths, or strictly validate that the path is a single segment like `/dashboard` or `/tutorial/go/...` and does not contain `..`, `%2e`, or protocol-like patterns.

---

### 13. Verify-Email Token in URL

**Severity:** Medium  
**Files:** `src/app/verify-email/page.tsx`, `src/app/api/auth/verify-email/route.ts`

**Issue:** The verification token is passed as a query parameter: `/api/auth/verify-email?token=...`. Tokens can leak via Referer, server logs, and browser history.

**Fix:** Prefer POST with token in the body. If GET is required for "click link in email" UX, ensure tokens are single-use and short-lived (already 24h), and avoid logging the full URL.

---

## Low Severity

### 14. JWT Secret Management

**Severity:** Low  
**File:** `src/lib/auth.ts`

**Observation:** JWT uses HS256 with `process.env.JWT_SECRET`. No rotation mechanism. Ensure the secret is strong (32+ bytes), stored securely, and rotated if compromised.

---

### 15. Session Duration (30 Days)

**Severity:** Low  
**File:** `src/lib/auth.ts`

**Observation:** 30-day sessions are convenient but increase the window for stolen-token abuse. Consider shorter sessions with refresh tokens, or sliding expiration.

---

### 16. Middleware Only Validates JWT, Not Token Version

**Severity:** Low  
**File:** `src/middleware.ts`

**Issue:** Middleware verifies the JWT signature but does not check `token_version` or `locked_until`. Those checks happen in `getCurrentUser()` inside route handlers. For `/api/admin`, an invalidated (e.g., logged-out) token could pass middleware and only fail in the handler. This is acceptable but means middleware provides a fast path, not full auth.

---

### 17. OAuth State Not Bound to Session

**Severity:** Low  
**File:** `src/app/api/auth/google/route.ts`

**Observation:** OAuth state is stored in a cookie. There is no cryptographic binding to the initiating session. In theory, an attacker could initiate OAuth, get a state, and trick a victim into completing the callback with that state. Mitigated by sameSite cookies and short state TTL (10 min). Consider binding state to a session or nonce stored server-side.

---

### 18. Error Messages in 500 Responses

**Severity:** Low  
**File:** `src/lib/api-utils.ts`

**Observation:** 500 responses include `requestId` for debugging. Ensure production logging does not expose stack traces or sensitive data to the client.

---

## Positive Findings

| Area | Status |
|------|--------|
| **JWT** | HS256, expiry set, token version checked in `getCurrentUser` |
| **Password hashing** | bcrypt with cost 10 |
| **Cookies** | httpOnly, secure in prod, sameSite: lax |
| **CSRF** | Double-submit cookie pattern; used on profile, admin, billing, etc. |
| **OAuth** | State param validated; PKCE not used (server-side flow, acceptable) |
| **Admin routes** | Protected by `requireAdmin`; middleware pre-checks JWT |
| **Forgot password** | No user enumeration; constant response |
| **Token entropy** | Password reset: UUID; email verify: 32 bytes hex; OAuth state: 16 bytes hex |
| **Security headers** | X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy |
| **SQL** | Parameterized queries (postgres.js tagged templates) |
| **Webhook replay** | 5-minute timestamp tolerance |

---

## Recommendations Summary

1. **Immediate:** Fix rate limit IP spoofing (critical for login/signup/forgot-password).
2. **Immediate:** Stop trusting `custom_data.userId` in Paddle webhook; use server-side mapping.
3. **Immediate:** Use timing-safe comparison for Paddle webhook signature.
4. **High priority:** Add CSRF to login/signup; invalidate sessions on password change and logout.
5. **Medium priority:** Remove dead token comparison clauses; unify password policy; harden redirect validation.
6. **Ongoing:** Rotate JWT secret if compromised; consider shorter sessions or refresh tokens.

---

## Appendix: Files Audited

- `src/lib/auth.ts`
- `src/lib/csrf.ts`
- `src/lib/rate-limit.ts`
- `src/lib/api-utils.ts`
- `src/lib/api-client.ts`
- `src/lib/email.ts`
- `src/lib/db/passwords.ts`
- `src/lib/db/users.ts`
- `src/lib/db/admin.ts`
- `src/lib/token-security.ts`
- `src/lib/password-policy.ts`
- `src/lib/auth-redirect.ts`
- `src/lib/db/rate-limit.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/google/callback/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/logout-all/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/billing/checkout/route.ts`
- `src/app/api/webhooks/paddle/route.ts`
- `src/middleware.ts`
- `next.config.ts`
