# Deployment Guide — Apt.Bed (apartmentloftbed.com)

Production stack: **VPS (Ubuntu)** running Next.js under **PM2**, behind **Caddy**
(reverse proxy + automatic HTTPS) · **PostgreSQL** self-hosted on the same box ·
**Stripe** (payments) · **Cloudinary** (media) · **Resend** (email).

This app is one Next.js codebase (App Router). Deploying = provisioning one Linux
VPS, installing Node + PostgreSQL, setting environment variables, building the app,
running the DB migration, and putting Caddy in front of it for TLS.

---

## 0. Prerequisites
- A VPS (2 vCPU / 2–4 GB RAM is comfortable) running **Ubuntu 22.04 or 24.04**,
  with a public IPv4 and root/sudo SSH access.
- Accounts: Stripe, Cloudinary, Resend, and the domain registrar for `apartmentloftbed.com`.
- DNS access to point `apartmentloftbed.com` (and `www`) at the VPS IP.
- Node 20.9+ / `git` locally, and this repository.

Point DNS first so certificates can issue later:
- `A` record `apartmentloftbed.com` → `<VPS_IP>`
- `A` record `www.apartmentloftbed.com` → `<VPS_IP>`

---

## 1. Server baseline

SSH in as root (or a sudo user) and install the toolchain.

```bash
# System packages
apt update && apt upgrade -y
apt install -y curl git ufw

# Node 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 process manager (global)
npm install -g pm2

# Firewall: allow SSH + HTTP/HTTPS only
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
```

> Recommended: create a non-root deploy user and run the app as that user rather
> than root. `adduser deploy && usermod -aG sudo deploy`, then do the app steps
> below as `deploy`.

---

## 2. Database — self-hosted PostgreSQL

1. Install and start PostgreSQL:
   ```bash
   apt install -y postgresql postgresql-contrib
   systemctl enable --now postgresql
   ```
2. Create the database and an app user:
   ```bash
   sudo -u postgres psql <<'SQL'
   CREATE USER aptbed WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
   CREATE DATABASE aptbed OWNER aptbed;
   SQL
   ```
3. In `prisma/schema.prisma`, switch the datasource block to PostgreSQL (the exact
   block is documented in-file directly under the current one):
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
   The models are already Postgres-safe (no SQLite-only types), so no model edits
   are needed.
4. Because Postgres is local, both URLs point at `localhost` and are identical —
   there is no pooler. In the app's `.env` (see §5):
   ```bash
   DATABASE_URL="postgresql://aptbed:CHANGE_ME_STRONG_PASSWORD@localhost:5432/aptbed?schema=public"
   DIRECT_URL="postgresql://aptbed:CHANGE_ME_STRONG_PASSWORD@localhost:5432/aptbed?schema=public"
   ```
5. Create the schema and seed (run from the app directory after §4):
   ```bash
   npx prisma migrate deploy      # or: npx prisma db push   (first time)
   node prisma/seed.mjs           # seeds catalogue, tax rates, admin user
   ```

**Backups** (you own these now — Postgres is on your box). Add a nightly dump:
```bash
# /etc/cron.d/aptbed-backup  — nightly pg_dump, keep 14 days
0 3 * * *  postgres  pg_dump aptbed | gzip > /var/backups/aptbed-$(date +\%F).sql.gz && find /var/backups -name 'aptbed-*.sql.gz' -mtime +14 -delete
```
Ensure `/var/backups` exists and is writable by the `postgres` user.

---

## 3. Media — Cloudinary
1. Cloudinary dashboard → copy the **API environment variable** (`CLOUDINARY_URL`,
   format `cloudinary://<key>:<secret>@<cloud>`).
2. Set `CLOUDINARY_URL` in the app `.env` (§5). Uploads (product images, homepage
   photos, assembly videos) then go to Cloudinary automatically, served over its
   CDN with video transcoding. Recommended even though the VPS disk is persistent,
   so media is off-box, backed up, and CDN-delivered.

---

## 4. Get the code + build

As the deploy user:
```bash
git clone <this-repo-url> /home/deploy/aptbed
cd /home/deploy/aptbed
npm ci                    # installs deps + runs prisma generate
```
Continue to §5 to create `.env`, then build:
```bash
npm run build             # prisma generate && next build
```

---

## 5. Environment variables

Create `/home/deploy/aptbed/.env` (never commit it). See `.env.example` for the
full annotated list. Minimum for production:

```bash
# Database (local Postgres — §2)
DATABASE_URL="postgresql://aptbed:...@localhost:5432/aptbed?schema=public"
DIRECT_URL="postgresql://aptbed:...@localhost:5432/aptbed?schema=public"

# Auth
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://apartmentloftbed.com"

# Payments (live)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
RESEND_FROM="Victory Martin <orders@apartmentloftbed.com>"

# Media
CLOUDINARY_URL="cloudinary://<key>:<secret>@<cloud>"

# Tax + freight
TAX_MODE="table"          # or "stripe" for Stripe Tax
FREIGHT_PROVIDER="flat"
```
Generate the auth secret with `openssl rand -base64 32`.

---

## 6. Payments — Stripe (live)
1. Stripe dashboard → **live** mode → copy `sk_live_...` into `STRIPE_SECRET_KEY`.
2. Create a webhook endpoint pointing at `https://apartmentloftbed.com/api/webhooks/stripe`,
   subscribe to `checkout.session.completed`, copy the signing secret (`whsec_...`)
   into `STRIPE_WEBHOOK_SECRET`.
3. (Optional) For automated tax, set `TAX_MODE="stripe"`; otherwise the built-in
   editable state-rate table is used.

## 7. Email — Resend
1. Resend dashboard → **Domains** → add `apartmentloftbed.com` and add the DNS
   records it lists (SPF/DKIM) at your registrar. Wait for it to verify.
2. **API Keys** → create a key → copy it into `RESEND_API_KEY` (`re_...`).
3. Set `RESEND_FROM="Victory Martin <orders@apartmentloftbed.com>"` (the address
   must be on the verified domain). Before the domain verifies you can test with
   `RESEND_FROM="Victory Martin <onboarding@resend.dev>"`.

---

## 8. Run the app under PM2

Next.js listens on `127.0.0.1:3000` (Caddy proxies to it — never expose 3000
publicly). Start it under PM2 and enable boot persistence:

```bash
cd /home/deploy/aptbed
pm2 start npm --name aptbed -- run start
pm2 save
pm2 startup            # prints a command — run it (with sudo) to install the boot service
```

Useful PM2 commands:
```bash
pm2 logs aptbed        # tail logs
pm2 restart aptbed     # restart after a redeploy
pm2 status             # process health
```

## 9. Reverse proxy + SSL — Caddy

Caddy provisions and auto-renews Let's Encrypt certificates with zero config, as
long as DNS (§0) points at this server and ports 80/443 are open (§1).

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

Replace `/etc/caddy/Caddyfile` with:
```caddyfile
apartmentloftbed.com, www.apartmentloftbed.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
```
Then reload:
```bash
systemctl reload caddy
```
Caddy fetches certificates on first request; `https://apartmentloftbed.com` is live
within a few seconds of DNS resolving.

---

## 10. Post-deploy verification
- `GET https://apartmentloftbed.com/api/health` → `{"status":"ok","db":"up", integrations:{stripe:true,email:true,media:"cloudinary",...}}`.
- Run the full **QA_CHECKLIST.md** pass.
- Place one real test order (a Stripe test card in staging, then a small live
  order), confirm it appears in the customer + admin dashboards and the
  confirmation email arrives.

---

## Redeploys

Use the wrapper script — it refuses a dirty tree, fetches the branch, installs,
migrates, builds, restarts PM2, and health-checks (aborting before restart on any
failure, and printing a rollback command if the health check fails):
```bash
cd /home/deploy/aptbed
chmod +x scripts/deploy.sh      # first time only
./scripts/deploy.sh             # override: APP_NAME=… BRANCH=… ./scripts/deploy.sh
```

Or do it manually:
```bash
cd /home/deploy/aptbed
git pull
npm ci
npx prisma migrate deploy      # applies any new migrations
npm run build
pm2 restart aptbed
```

## Freight rates
`FREIGHT_PROVIDER="flat"` uses the admin-editable flat rate (Admin → Settings).
When the carrier is finalized, set `FREIGHT_PROVIDER="carrier"` and implement the
rating call in `lib/freight.ts` (`CarrierFreightProvider.quote`) using
`FREIGHT_CARRIER_API_KEY` / `FREIGHT_CARRIER_URL`. Checkout keeps working (falls
back to flat) until then — no other code changes required.

## Rollback
- **App:** `git checkout <last-good-commit>`, `npm ci && npm run build`, then
  `pm2 restart aptbed`. (Tag known-good releases to make this one step.)
- **Database:** restore the most recent nightly dump —
  `gunzip -c /var/backups/aptbed-<date>.sql.gz | sudo -u postgres psql aptbed`.
  Consider enabling WAL archiving / PITR if you need finer-grained recovery.
