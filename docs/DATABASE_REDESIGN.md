# Database redesign for monetization (no hardcoded plans/prices)

This doc lists **all current tables** and proposes **new/updated tables** so plans, prices, free limits, and labels come from the database instead of env vars and code constants.

---

## Part 1: All current tables

### In `scripts/migrate.sql`

| Table | Purpose |
|-------|--------|
| **users** | Accounts: name, email, password, Google ID, avatar, xp, streaks, theme, admin, email_verified, token_version, **plan** (TEXT: 'free'\|'pro'\|'yearly'), **stripe_customer_id** (used for Paddle customer ID) |
| **progress** | Per-user tutorial completion (user_id, tutorial_slug) |
| **page_views** | Anonymous/page view counts |
| **achievements** | Unlocked badges per user |
| **bookmarks** | Saved code snippets per tutorial |
| **activity_log** | User action log |
| **password_reset_tokens** | One-time reset tokens |
| **subscriptions** | Legacy Stripe-style (stripe_customer_id, stripe_subscription_id, stripe_price_id, status, period) — **not used for Paddle** |
| **ratings** | Tutorial thumbs up/down |
| **playground_snippets** | Shared snippets by share_id |
| **rate_limits** | Rate limit key + hit_at |
| **practice_views** | Counts for “popular” practice problems |

### Created in application code (CREATE TABLE IF NOT EXISTS)

| Table | Purpose |
|-------|--------|
| **code_snapshots** | Saved code per user/lang/slug/step |
| **step_progress** | Per-step completion (user, tutorial_slug, step_index, language) |
| **tutorial_messages** | Chat/discussion messages per tutorial step |
| **code_drafts** | Draft code per user/language/slug/editor_key |
| **step_notes** | User notes per tutorial step |
| **challenge_runs** | Challenge mode times (user, tutorial_slug, total_ms, steps_count) |
| **practice_attempts** | Per-user problem status (solved/failed) |
| **notifications** | In-app notifications (user, type, title, message, read) |
| **ai_feedback_cache** | Cached AI feedback by cache_key |
| **step_checks** | Aggregated step pass/fail counts (no user_id) |
| **admin_audit_log** | Admin actions (admin_id, action, target_user_id) |
| **subscription_events** | Revenue events (user_id, plan TEXT, amount_cents, event_type) |

**Total: 24 tables.**

---

## Part 2: What is hardcoded today

| What | Where | Current value / logic |
|------|--------|------------------------|
| Plan slugs | Code, UI | `'free'`, `'pro'`, `'yearly'` |
| Free vs paid | `src/lib/plans.ts` | `hasPaidAccess(plan)` → true if plan === 'yearly' \|\| plan === 'pro' |
| Free tutorial limit | `src/lib/plans.ts` | `FREE_TUTORIAL_LIMIT = 5` (tutorials with order ≤ 5 are free) |
| Paddle price IDs | Env vars | `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID`, `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` |
| Paddle client token | Env | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` |
| Plan labels in UI | Components | "Free", "Pro", "Yearly", "Monthly Pro", "Yearly Pro" |
| Amounts for revenue | Webhook | `amountCents = yearly ? 4999 : 999` |
| Which price = yearly | Webhook | Compare `purchasedPriceId === process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` |

Goal: move **plans**, **prices** (including external Paddle ID and amount), **free limit**, and **display names** into the database; app and webhook read from there.

---

## Access model (product rule)

**The paid plan unlocks all tutorials and all practice problems.**

- **Free plan:** Only the first N tutorials are accessible (N = `free_tutorial_limit` on the plan, e.g. 5). Practice can be all free or limited by product choice; the DB supports either via the same plan flags.
- **Paid plan (Pro / Yearly):** Full access — all tutorials and all practice. No per-item tables needed; one `is_free` + `free_tutorial_limit` on `plans` is enough.

So: one plan row for free (with `free_tutorial_limit`), one or two for paid (monthly/yearly with no limit). No `tutorial_access` or per-practice gating table required.

---

## Part 3: Proposed new/updated tables (money features, no hardcoding)

### 1. `plans`

Stores every plan (free, monthly pro, yearly pro, etc.) and their rules. **Paid plans grant all tutorials + all practice.**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | |
| slug | TEXT UNIQUE NOT NULL | e.g. `free`, `pro`, `yearly` |
| name | TEXT NOT NULL | Display name, e.g. "Free", "Monthly Pro", "Yearly Pro" |
| description | TEXT | Short copy for pricing page |
| sort_order | INTEGER NOT NULL DEFAULT 0 | For listing (free first, then monthly, yearly) |
| is_free | BOOLEAN NOT NULL DEFAULT true | If true, user has no paid subscription |
| free_tutorial_limit | INTEGER | For free plan: max tutorial order (1-based) included. For paid: NULL (unlocks **all tutorials and all practice**). |
| features | JSONB | Optional list of feature flags or labels for pricing table |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Example rows:**  
`(slug: 'free', name: 'Free', is_free: true, free_tutorial_limit: 5)` → first 5 tutorials only.  
`(slug: 'pro', name: 'Monthly Pro', is_free: false, free_tutorial_limit: null)` → all tutorials + all practice.  
`(slug: 'yearly', name: 'Yearly Pro', is_free: false, free_tutorial_limit: null)` → all tutorials + all practice.

- **App:** Replace `FREE_TUTORIAL_LIMIT` and `hasPaidAccess(plan)` with: user's `plan_id` → plan's `is_free` and `free_tutorial_limit`. If `!is_free` (paid), grant all tutorials and all practice; if free, allow only tutorials with order ≤ `free_tutorial_limit`.
- **Paywall:** “Is this tutorial (order) allowed for this user?” → user’s `plan_id` → plan’s `is_free` and `free_tutorial_limit`.

---

### 2. `prices`

Stores prices tied to a plan and to Paddle (or another provider). One plan can have multiple prices (e.g. monthly vs yearly).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | |
| plan_id | INTEGER NOT NULL REFERENCES plans(id) | Which plan this price grants |
| external_id | TEXT NOT NULL | Paddle price ID (e.g. `pri_01...`); unique per provider |
| provider | TEXT NOT NULL DEFAULT 'paddle' | e.g. `paddle`, `stripe` |
| amount_cents | INTEGER NOT NULL | e.g. 999, 4999 |
| currency | TEXT NOT NULL DEFAULT 'USD' | |
| interval | TEXT NOT NULL | `month` or `year` |
| is_default | BOOLEAN NOT NULL DEFAULT false | If multiple prices per plan, which one to show by default |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Unique:** `(provider, external_id)`.

- **Checkout / UI:** Resolve “monthly” / “yearly” by `plan.slug` or `prices.interval`, not by env. Return `external_id` and (if needed) `amount_cents` from DB.
- **Webhook:** On Paddle event, look up `prices` by `external_id` → get `plan_id` (and amount). Set user’s plan from `plan_id`; record revenue from `prices.amount_cents`.

---

### 3. `users` (changes)

Keep one “current plan” per user; point to `plans` instead of free-text.

| Change | Description |
|--------|-------------|
| plan | Replace `plan TEXT` with **plan_id INTEGER REFERENCES plans(id)**. Default = id of plan with slug `free`. |
| stripe_customer_id | Rename to **billing_customer_id** (or keep name but document: “Paddle customer ID when provider is Paddle”). |

- **Migration:** Insert default `plans` row for `free`; update existing `users.plan` to `plan_id` via mapping `'free'->free_plan_id`, `'pro'->pro_plan_id`, `'yearly'->yearly_plan_id` (from new `plans` rows).

---

### 4. `subscriptions` (redesign for Paddle)

Use for “current subscription” per user (replacing or coexisting with legacy Stripe columns).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | |
| user_id | INTEGER NOT NULL UNIQUE REFERENCES users(id) | One active subscription per user |
| plan_id | INTEGER NOT NULL REFERENCES plans(id) | Current plan |
| price_id | INTEGER REFERENCES prices(id) | Which price they’re on (nullable if free) |
| provider | TEXT NOT NULL DEFAULT 'paddle' | |
| provider_customer_id | TEXT | Paddle customer ID |
| provider_subscription_id | TEXT | Paddle subscription ID |
| status | TEXT NOT NULL | e.g. `active`, `canceled`, `past_due` |
| current_period_start | TIMESTAMPTZ | |
| current_period_end | TIMESTAMPTZ | |
| cancel_at_period_end | BOOLEAN NOT NULL DEFAULT false | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

- **Webhook:** On `subscription.activated` / `subscription.updated`, find or create row by `user_id`, set `plan_id` from `prices.external_id`, update `users.plan_id` and `users.billing_customer_id` for quick reads.
- **Billing UI:** Show current plan/price from `subscriptions` + `plans` + `prices` (no env for labels or amounts).

---

### 5. `subscription_events` (keep, make data-driven)

Keep for revenue and analytics; link to plan/price instead of free text.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | (existing) |
| user_id | INTEGER REFERENCES users(id) | (existing) |
| plan_id | INTEGER REFERENCES plans(id) | **New:** replace `plan TEXT` |
| price_id | INTEGER REFERENCES prices(id) | **New:** optional; source of amount |
| amount_cents | INTEGER NOT NULL | (existing); can copy from `prices.amount_cents` at event time |
| event_type | TEXT NOT NULL | (existing) e.g. `activated`, `canceled` |
| created_at | TIMESTAMPTZ | (existing) |

- **Webhook:** When recording “activated”, set `plan_id` and `price_id` from lookup by Paddle price ID; `amount_cents` from `prices.amount_cents` (no hardcoded 999/4999).

---

### 6. Optional: `tutorial_access` (if you want per-tutorial gating by plan)

If you prefer “which plans can access which tutorials” in DB instead of “order ≤ free_tutorial_limit”:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | |
| tutorial_slug | TEXT NOT NULL | |
| plan_id | INTEGER NOT NULL REFERENCES plans(id) | Plan that can access this tutorial |
| created_at | TIMESTAMPTZ | |

**Unique:** (tutorial_slug, plan_id).

- Free plan gets rows for first N tutorials (by slug); paid plans get a single “all” or per-tutorial rows. App checks: “user’s plan_id in (SELECT plan_id FROM tutorial_access WHERE tutorial_slug = ?)”.

If you keep **free_tutorial_limit** on `plans`, you don’t need this table; the limit is “tutorial order ≤ free_tutorial_limit”. Use this table only if you want explicit per-tutorial, per-plan rules.

---

## Part 4: Summary – tables you need (full list)

**Keep as-is (no structural change for money):**  
progress, page_views, achievements, bookmarks, activity_log, password_reset_tokens, ratings, playground_snippets, rate_limits, practice_views, code_snapshots, step_progress, tutorial_messages, code_drafts, step_notes, challenge_runs, practice_attempts, notifications, ai_feedback_cache, step_checks, admin_audit_log.

**New:**

1. **plans** – Plan definitions (slug, name, is_free, free_tutorial_limit, etc.).
2. **prices** – Prices per plan (external_id for Paddle, amount_cents, interval).

**Modify:**

3. **users** – Add `plan_id` (FK to plans); keep or rename `stripe_customer_id` → billing customer ID.
4. **subscriptions** – Redesign for Paddle (plan_id, price_id, provider_*, status, period).
5. **subscription_events** – Add `plan_id`, `price_id`; derive amount from DB.

**Optional:**

6. **tutorial_access** – Only if you want DB-driven “which plan can see which tutorial” instead of `free_tutorial_limit`.

**Legacy:**

- Old **subscriptions** (Stripe columns): drop or keep for historical data; new Paddle flow uses the redesigned `subscriptions` (and `plans` + `prices`).

---

## Part 5: Env vars after redesign

- **Still in env:**  
  - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (or load from backend that reads a single “current” token from DB if you add a `settings` table later).  
  - `PADDLE_WEBHOOK_SECRET`, `DATABASE_URL`, etc.
- **No longer in env:**  
  - `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID`, `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` → come from `prices.external_id` (API returns the right price ID for “monthly”/“yearly” from DB).
- **No longer in code:**  
  - `FREE_TUTORIAL_LIMIT`, `hasPaidAccess(plan)`, plan labels, and hardcoded amount_cents → all from `plans` and `prices`.

---

## Part 6: Migration order (high level)

1. Create **plans** and **prices**; seed with current free/pro/yearly and current Paddle price IDs + amounts.
2. Add **users.plan_id** (nullable at first); backfill from current `users.plan` text; then set NOT NULL and drop `users.plan`.
3. Rename **users.stripe_customer_id** → **billing_customer_id** (or keep name, document it).
4. Redesign **subscriptions** (new columns or new table); migrate existing Stripe data if needed.
5. Add **subscription_events.plan_id** and **subscription_events.price_id**; backfill from existing events; then drop `subscription_events.plan` if you had it.
6. Update app and webhook to read/write only from `plans`, `prices`, `users.plan_id`, and new `subscriptions`/`subscription_events`.

If you want, next step can be a concrete `migrate.sql` (or incremental migration scripts) that implement this redesign step by step.
