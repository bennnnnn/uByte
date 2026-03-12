# Go Tutorials (uByte)

An interactive Go learning platform built with Next.js. Learn Go through concise tutorials with a live code playground, progress tracking, XP system, and achievements. **Multi-language ready** — structure supports adding Python, C++, and more.

## Features

- 19+ Go tutorials from beginner to advanced
- Interactive code playground (runs real Go code via go.dev)
- Progress tracking with XP and streaks
- Badges and achievements
- Bookmarks & code snapshots
- Dark/light/system theme
- Freemium signup wall (5 free page views)
- **Modular architecture** for adding Python, C++ and other languages

## Tutorials

1. Getting Started
2. Variables & Data Types
3. fmt Package
4. Control Flow
5. Loops
6. Arrays & Slices
7. Maps
8. Functions
9. Pointers
10. Structs
11. Methods
12. Interfaces
13. Error Handling
14. Packages & Modules
15. Concurrency

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Content**: MDX with gray-matter (`content/go/` per language)
- **Database**: Neon PostgreSQL
- **Auth**: JWT with HttpOnly cookies, Google OAuth, CSRF protection
- **Styling**: Tailwind CSS 4
- **Syntax highlighting**: Custom client-side Go highlighter

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Build

```bash
npm run build
npm start
```

## Pre-Launch Checklist

### Email Deliverability (DNS — one-time setup in your DNS provider)

These records must be set before sending transactional emails from Resend, or emails will land in spam.

| Record | Type | Purpose |
|--------|------|---------|
| `resend._domainkey.yourdomain.com` | TXT | **DKIM** — proves emails are sent by you. Copy from Resend → Domains. |
| `@` or `yourdomain.com` | TXT `v=spf1 include:amazonses.com ~all` | **SPF** — authorises Resend's servers to send on your behalf. |
| `_dmarc.yourdomain.com` | TXT `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` | **DMARC** — policy for what to do with unauthenticated mail. Start with `p=none` while testing. |

**Steps:**
1. Log in to [Resend](https://resend.com) → **Domains** → Add your domain → copy the DNS records shown.
2. Paste them into your DNS provider (Cloudflare, Route 53, etc.).
3. Wait up to 24 h for propagation. Resend shows ✓ when each record is verified.
4. Send a test email; check headers for `dkim=pass` and `spf=pass`.
5. Use [mail-tester.com](https://www.mail-tester.com) to score your deliverability (aim for 9+/10).

### Environment Variables (production)

Make sure all of these are set in Vercel → Settings → Environment Variables:

```
DATABASE_URL               # Neon PostgreSQL connection string
JWT_SECRET                 # Random 32+ char secret
GOOGLE_CLIENT_ID           # Google OAuth client ID
GOOGLE_CLIENT_SECRET       # Google OAuth client secret
RESEND_API_KEY             # Resend API key
RESEND_FROM_EMAIL          # Verified sender address (e.g. hello@yourdomain.com)
PADDLE_API_KEY             # Paddle v2 API key
PADDLE_WEBHOOK_SECRET      # Paddle webhook secret
PADDLE_ENVIRONMENT         # "production" or "sandbox"
CRON_SECRET                # Random secret for Vercel cron auth
NEXT_PUBLIC_POSTHOG_KEY    # PostHog project API key (optional)
VAPID_PUBLIC_KEY           # Web Push VAPID public key
VAPID_PRIVATE_KEY          # Web Push VAPID private key
```

### Database Migrations

Run all pending migrations before going live:

```bash
node scripts/run-migrate.mjs
```

### Vercel Cron Jobs

Ensure these cron jobs are active in `vercel.json`:
- `streak-reminder` — daily streak nudge emails
- `cleanup` — stale session / push subscription cleanup
- `onboarding-drip` — welcome + win-back email sequence
- `weekly-digest` — weekly progress summary emails
