# Deployment Guide — Apt.Bed (victorymartin.com)

Production stack: **Railway** (Next.js host) · **Neon** (PostgreSQL) · **Stripe** (payments) · **Cloudinary** (media) · **Mailgun** (email).

This app is one Next.js codebase (App Router). Deploying = provisioning the four
services below, setting environment variables, running the DB migration, and
pointing the domain at Railway.

---

## 0. Prerequisites
- Accounts: Railway, Neon, Stripe, Cloudinary, Mailgun, and the domain registrar for `victorymartin.com`.
- Node 20.9+ locally, `git`, and this repository.

---

## 1. Database — Neon (PostgreSQL)
1. Create a Neon project → copy the **pooled** and **direct** connection strings.
2. In `prisma/schema.prisma`, switch the datasource block to PostgreSQL (the
   exact block is documented in-file directly under the current one):
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")   // pooled (…-pooler…)
     directUrl = env("DIRECT_URL")     // direct
   }
   ```
3. Locally, set `DATABASE_URL` + `DIRECT_URL` and create the schema:
   ```bash
   npx prisma migrate deploy      # or: npx prisma db push   (first time)
   node prisma/seed.mjs           # seeds catalogue, tax rates, admin user
   ```
   The models are already Postgres-safe (no SQLite-only types), so no model edits are needed.

## 2. Media — Cloudinary
1. Cloudinary dashboard → copy the **API environment variable** (`CLOUDINARY_URL`,
   format `cloudinary://<key>:<secret>@<cloud>`).
2. Set `CLOUDINARY_URL` in Railway. Uploads (product images, homepage photos,
   assembly videos) then go to Cloudinary automatically. **This is required in
   production** — Railway's filesystem is ephemeral and would lose local uploads.

## 3. Payments — Stripe (live)
1. Stripe dashboard → **live** mode → copy `sk_live_...` into `STRIPE_SECRET_KEY`.
2. Create a webhook endpoint pointing at `https://victorymartin.com/api/webhooks/stripe`,
   subscribe to `checkout.session.completed`, copy the signing secret (`whsec_...`)
   into `STRIPE_WEBHOOK_SECRET`.
3. (Optional) For automated tax, set `TAX_MODE="stripe"`; otherwise the built-in
   editable state-rate table is used.

## 4. Email — Mailgun
1. Add + verify the sending domain in Mailgun (add the DNS records it lists).
2. Copy the API key into `MAILGUN_API_KEY` and set `MAILGUN_DOMAIN` to the verified
   domain (e.g. `mg.victorymartin.com`).
3. Set `MAILGUN_FROM="Victory Martin <orders@victorymartin.com>"`. EU accounts also
   set `MAILGUN_API_BASE="https://api.eu.mailgun.net"`.

## 5. App host — Railway
1. New Railway project → **Deploy from GitHub repo** (this repo).
2. Build command `npm run build`, start command `npm run start` (defaults work).
3. Add all environment variables (see `.env.example` for the full list):
   `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`,
   `MAILGUN_FROM`, `CLOUDINARY_URL`, `TAX_MODE`, `FREIGHT_PROVIDER`.
4. Generate a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and set
   `NEXTAUTH_URL="https://victorymartin.com"`.

## 6. Domain & SSL
1. Railway → the service → **Settings → Domains** → add `victorymartin.com`
   (and `www`).
2. At the registrar, point DNS as Railway instructs (CNAME/ANAME). Railway
   provisions SSL automatically once DNS resolves.

## 7. Post-deploy verification
- `GET https://victorymartin.com/api/health` → `{"status":"ok","db":"up", integrations:{stripe:true,email:true,media:"cloudinary",...}}`.
- Run the full **QA_CHECKLIST.md** pass.
- Place one real test order (a Stripe test card in staging, then a small live
  order), confirm it appears in the customer + admin dashboards and the
  confirmation email arrives.

---

## Freight rates
`FREIGHT_PROVIDER="flat"` uses the admin-editable flat rate (Admin → Settings).
When the carrier is finalized, set `FREIGHT_PROVIDER="carrier"` and implement the
rating call in `lib/freight.ts` (`CarrierFreightProvider.quote`) using
`FREIGHT_CARRIER_API_KEY` / `FREIGHT_CARRIER_URL`. Checkout keeps working (falls
back to flat) until then — no other code changes required.

## Rollback
Railway keeps previous deploys — redeploy the last good one from the dashboard.
Neon supports point-in-time restore / branching for the database.
