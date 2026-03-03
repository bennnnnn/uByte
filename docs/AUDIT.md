# uByte Startup Audit — Security, Structure, SEO, UI, Monetization

**Last updated:** From full codebase audit. Use this as a living checklist to harden the product and improve conversion.

---

## 1. Security

### Summary
Auth uses JWT in HttpOnly cookies with token versioning. CSRF is used on many mutation routes; **logout and billing checkout now enforce CSRF**. DB access is parameterized (Neon); no raw SQL concatenation. Webhook signatures (Paddle/Stripe) are verified.

### Done
- [x] CSRF on `POST /api/auth/logout`
- [x] CSRF on `POST /api/billing/checkout`
- [x] Env vars: no server secrets in `NEXT_PUBLIC_*`; Paddle client token/price IDs are intentionally public for Paddle.js

### Done (this pass)
- [x] CSRF on `POST /api/chat`.
- [x] `GET /api/chat` documented as intentionally public (community discussions).

### To do (priority)
| Priority | Action |
|----------|--------|
| **Medium** | `npm audit` reports 5 high (serialize-javascript → Sentry/webpack). Fix via `npm audit fix --force` downgrades Sentry to v7; accept or upgrade Sentry when a patched version is available. |
| **Medium** | CSP allows `unsafe-inline` / `unsafe-eval` for Next + Paddle; document and consider tightening where possible. |
| **Low** | JWT dev fallback in `src/lib/auth.ts` — ensure staging has `JWT_SECRET` set. |

### Key files
`next.config.ts` (headers), `src/lib/auth.ts`, `src/lib/csrf.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/billing/checkout/route.ts`, `src/app/api/webhooks/paddle/route.ts`

---

## 2. Structure & modularity

### Summary
App Router with clear route segments. Shared components and `lib/` are organized. **BASE_URL is now centralized in `@/lib/constants`** and used across auth, email, sitemap, OG, and certificate.

### Done
- [x] Single `BASE_URL` source: `src/lib/constants.ts` used in layout, sitemap, robots, auth callbacks, forgot-password, email, certificate, `u/[userId]`, tutorial pages.

### Done (this pass)
- [x] Judge0 shared in `src/lib/judge0.ts` (b64, fromb64, maybeDecodeJudge0Message, JUDGE0_LANG_IDS, normaliseJudge0RunOutput); `run-code` and `judge-code` use it.

### To do (priority)
| Priority | Action |
|----------|--------|
| **Medium** | Standardize API route order: CSRF → auth → body parse → logic. Consider a small `withAuthAndCsrf` helper. |
| **Low** | Group `lib/` into subdirs as it grows (e.g. `lib/auth/`, `lib/db/`). |
| **Low** | Optional: Next.js `middleware.ts` for global auth redirect or rate limit at edge. |

### Key files
`src/lib/constants.ts`, `src/lib/api-utils.ts`, `src/app/api/**/route.ts`

---

## 3. Syntax & code quality

### Summary
TypeScript strict; API routes use `withErrorHandling`. Some routes use `await verifyCsrf()` even though it’s sync — works but could be clarified.

### Done (this pass)
- [x] Billing checkout body validated with Zod (`CheckoutBody`).
- [x] `withErrorHandling` returns `requestId` in 500 JSON and logs `[requestId] routeName error`.

### To do (priority)
| Priority | Action |
|----------|--------|
| **Low** | Call `verifyCsrf` synchronously (no `await`) for consistency. |
| **Low** | Add Zod (or similar) to other mutation routes (progress, chat body, etc.) as needed. |

### Key files
`src/lib/api-utils.ts`, `src/lib/csrf.ts`, `src/app/api/billing/checkout/route.ts`, `src/app/api/run-code/route.ts`, `src/app/api/judge-code/route.ts`

---

## 4. SEO

### Summary
Metadata, Open Graph, sitemap, robots, and canonical URLs are in place. JSON-LD on home and tutorial pages. **metadataBase** uses `BASE_URL`.

### To do (priority)
| Priority | Action |
|----------|--------|
| **Medium** | Add OG image for key routes (pricing, practice index) or rely on default. |
| **Low** | Sitemap: use real `lastModified` from data where available instead of `new Date()`. |
| **Low** | Consider disallowing `/profile`, `/reset-password`, `/verify-email` in robots if you don’t want them indexed. |
| **Low** | Measure Core Web Vitals (LCP, FID, CLS) and optimize critical path. |

### Key files
`src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[lang]/[slug]/page.tsx`, `src/app/[lang]/[slug]/opengraph-image.tsx`

---

## 5. UI/UX

### Summary
Loading states on profile and leaderboard. **Error boundary** now has `role="alert"`, `aria-live`, and an `aria-label` on the reset button for accessibility.

### To do (priority)
| Priority | Action |
|----------|--------|
| **Done** | `loading.tsx` added for pricing, practice, search, admin. |
| **Done** | Main content wrapper has `id="main-content"` in root layout for skip link. |
| **Low** | Touch targets ≥ 44px; no critical actions keyboard-only without a visible alternative. |
| **Low** | Plan naming: keep “Pro” / “Monthly Pro” / “Yearly” consistent in UI and Paddle copy. |

### Key files
`src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/profile/loading.tsx`, `src/app/leaderboard/loading.tsx`, `src/app/layout.tsx`

---

## 6. Monetization readiness

### Summary
Paddle integrated; paywall uses `hasPaidAccess` and `FREE_TUTORIAL_LIMIT`. Webhook updates plan; profile shows plan and success state.

### To do (priority)
| Priority | Action |
|----------|--------|
| **Done** | `GET /api/tutorial-steps` enforces paywall: tutorials with `order > FREE_TUTORIAL_LIMIT` require auth + `hasPaidAccess(plan)`; otherwise 403. |
| **Done** | Conversion analytics: track “viewed pricing”, “clicked upgrade”, “checkout completed” (Vercel Analytics or Paddle). |
| **Low** | Post-purchase: consider a dedicated thank-you or onboarding step and a “purchase completed” event. |
| **Low** | Keep all plan/trial logic in `src/lib/plans.ts` to avoid UI/API drift. |

### Key files
`src/lib/plans.ts`, `src/components/UpgradeWall.tsx`, `src/components/Sidebar.tsx`, `src/app/pricing/page.tsx`, `src/app/api/billing/checkout/route.ts`, `src/app/api/webhooks/paddle/route.ts`, `src/app/api/**` (content APIs)

---

## Quick wins already applied (this pass)

1. **CSRF on logout** — Prevents cross-site logout attacks.
2. **CSRF on billing checkout** — Protects checkout initiation.
3. **CSRF on POST /api/chat** — Protects chat mutations.
4. **Central BASE_URL** — Single source in `src/lib/constants`; used in auth, email, certificate, OG, sitemap, robots.
5. **Error boundary a11y** — `role="alert"`, `aria-live="assertive"`, `aria-label` on “Try Again” button.

---

## Suggested next steps (order)

1. **npm audit** — Fix or document dependency risks (5 high: serialize-javascript via Sentry; audit fix --force is breaking).
2. **CSP** — Consider tightening where possible (unsafe-inline/unsafe-eval for Next + Paddle).
3. **OG images** — Add for pricing, practice index if desired.
4. **Core Web Vitals** — Measure and optimize.

Use this doc as a running checklist; tick items as you complete them and add new findings.
