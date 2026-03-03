# Paddle keys setup (step by step)

Start in **sandbox** to test without real payments. Switch to **live** when you're ready for production.

---

## Sandbox vs live

| | Sandbox | Live |
|---|--------|------|
| **Dashboard** | https://sandbox-vendors.paddle.com | https://vendors.paddle.com |
| **Use case** | Testing (no real money) | Production |
| **Client token** | Starts with `test_` | Starts with `live_` |
| **API base** | https://sandbox-api.paddle.com | https://api.paddle.com |

Use sandbox first. When everything works, repeat the same steps in the **live** dashboard and swap the keys in Vercel.

---

## Step 1: Client-side token

Used by your app as `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (Paddle.js in the browser).

1. Open **Sandbox dashboard**: https://sandbox-vendors.paddle.com  
2. Log in (or sign up for a sandbox account).
3. Go to **Developer tools** → **Authentication** (or direct: https://sandbox-vendors.paddle.com/authentication-v2 ).
4. Open the **Client-side tokens** tab.
5. Click **New client-side token**.
6. Enter a **name** (e.g. `Go tutorials – sandbox`) and optional **description**.
7. Click **Save**.
8. Click the **⋯** (or copy icon) next to the new token → **Copy**.
9. In Vercel (or `.env.local`), set:
   - **Name:** `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`  
   - **Value:** the copied token (e.g. `test_xxxxxxxxxxxxxxxxxxxxxxxx`).

---

## Step 2: Products and prices (monthly + yearly)

Your app needs two price IDs:

- `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID` → monthly plan  
- `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` → yearly plan  

You can use one product (e.g. “Pro”) with two prices, or two products. Below: one product, two prices.

### 2a. Create the product

1. In sandbox dashboard: **Catalog** → **Products**.
2. Click **New product**.
3. Fill in:
   - **Name:** e.g. `Pro`
   - **Description** (optional).
4. Click **Save**.

### 2b. Create the monthly price

1. Open the product you just created.
2. In the **Prices** section, click **New price**.
3. Set:
   - **Description:** e.g. `Pro monthly`
   - **Price:** your monthly amount (e.g. $9.99).
   - **Billing cycle:** e.g. Every 1 month.
4. Click **Save**.
5. Copy the **Price ID** (format like `pri_xxxxxxxx`).  
   → This is `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID`.

### 2c. Create the yearly price

1. Same product → **Prices** → **New price**.
2. Set:
   - **Description:** e.g. `Pro yearly`
   - **Price:** your yearly amount (e.g. $99.99).
   - **Billing cycle:** e.g. Every 1 year.
3. Click **Save**.
4. Copy the **Price ID**.  
   → This is `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID`.

Add both to Vercel:

- `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID` = monthly price ID  
- `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` = yearly price ID  

---

## Step 3: Webhook secret

Used to verify that webhooks really come from Paddle: `PADDLE_WEBHOOK_SECRET`.

1. In sandbox dashboard: **Developer tools** → **Notifications** (or **Webhooks** / **Notification destinations**).
2. Click **New destination** (or **Add endpoint**).
3. Set:
   - **Endpoint URL:**  
     `https://your-domain.com/api/webhooks/paddle`  
     For local testing you can use a tunnel (e.g. ngrok, Cloudflare Tunnel) and put that URL here.
   - **Events:** enable at least:
     - `subscription.activated`
     - `subscription.updated`
     - `subscription.canceled`
4. Save. Paddle will show an **Endpoint secret** (or **Signing secret**) for this destination.
5. Copy that secret.  
   → This is `PADDLE_WEBHOOK_SECRET` (server-only; do not put in client code).

If the secret is only shown once, store it in a password manager or Vercel env vars immediately.

---

## Checklist (sandbox)

| Env variable | Where to get it |
|--------------|-----------------|
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Developer tools → Authentication → Client-side tokens → New → Copy token |
| `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID` | Catalog → Products → your Pro product → Prices → monthly price ID (`pri_...`) |
| `NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID` | Same product → yearly price ID (`pri_...`) |
| `PADDLE_WEBHOOK_SECRET` | Developer tools → Notifications → New destination → Endpoint secret |

---

## Going live

1. Open the **live** dashboard: https://vendors.paddle.com  
2. Repeat the same steps:
   - Create a **client-side token** (will start with `live_`) → update `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`.
   - Create **product + monthly + yearly prices** in live Catalog → update both price ID env vars.
   - Create a **notification destination** with your production URL → copy the new **endpoint secret** → update `PADDLE_WEBHOOK_SECRET`.
3. In Vercel, set these env vars for **Production** (and optionally Preview if you want).
4. Redeploy so the new live keys are used.

Keep sandbox keys in a separate env (e.g. Preview or a `.env.local` for testing) so you can still test without touching live.

---

## Optional: Paddle.js script in sandbox

Your app loads Paddle.js from `https://cdn.paddle.com/paddle/v2/paddle.js`. For sandbox, some setups use `https://sandbox-cdn.paddle.com` when the client token is a sandbox token; Paddle may also infer environment from the token. If checkout doesn’t open in sandbox, check Paddle’s docs for “Initialize Paddle.js sandbox” and adjust the script URL if needed.
