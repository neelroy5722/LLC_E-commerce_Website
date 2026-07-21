#!/usr/bin/env bash
#
# Redeploy the Apt.Bed app on the production VPS.
# Run from the app directory as the deploy user:  ./scripts/deploy.sh
#
# Steps: fetch latest code → install deps → apply DB migrations → build →
# reload the PM2 process → health check. Any failure aborts before the restart.
#
# See docs/DEPLOYMENT.md for the full server setup this assumes.

set -euo pipefail

# --- Config (override via env) ----------------------------------------------
APP_NAME="${APP_NAME:-aptbed}"                       # PM2 process name
BRANCH="${BRANCH:-main}"                              # branch to deploy
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$APP_DIR"
echo "==> Deploying '$APP_NAME' from $APP_DIR (branch: $BRANCH)"

# --- Safety: refuse to deploy a dirty tree ----------------------------------
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERROR: uncommitted changes in the working tree. Commit/stash first." >&2
  git status --short >&2
  exit 1
fi

# --- 1. Fetch latest code ---------------------------------------------------
echo "==> Fetching latest code"
git fetch --prune origin
git checkout "$BRANCH"
PREV_COMMIT="$(git rev-parse HEAD)"           # remembered for rollback
git reset --hard "origin/$BRANCH"
echo "    $PREV_COMMIT -> $(git rev-parse HEAD)"

# --- 2. Install dependencies ------------------------------------------------
echo "==> Installing dependencies (npm ci)"
npm ci

# --- 3. Apply database migrations -------------------------------------------
echo "==> Applying database migrations (prisma migrate deploy)"
npx prisma migrate deploy

# --- 4. Build ---------------------------------------------------------------
echo "==> Building (npm run build)"
npm run build

# --- 5. Restart the app -----------------------------------------------------
echo "==> Restarting PM2 process '$APP_NAME'"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  echo "    process not found — starting it"
  pm2 start npm --name "$APP_NAME" -- run start
fi
pm2 save

# --- 6. Health check --------------------------------------------------------
echo "==> Health check: $HEALTH_URL"
ok=false
for i in $(seq 1 15); do
  if curl -fsS "$HEALTH_URL" | grep -q '"status":"ok"'; then
    ok=true
    break
  fi
  sleep 2
done

if [ "$ok" = true ]; then
  echo "==> Deploy complete — health check passed."
else
  echo "ERROR: health check did not pass after restart." >&2
  echo "       Inspect logs:   pm2 logs $APP_NAME --lines 100" >&2
  echo "       To roll back:    git reset --hard $PREV_COMMIT && npm ci && npm run build && pm2 restart $APP_NAME" >&2
  exit 1
fi
