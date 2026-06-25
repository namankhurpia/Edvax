#!/usr/bin/env bash
# One-command local bootstrap for EDVAX.
# Run this on YOUR machine (needs Docker Desktop running + git installed):
#   chmod +x start-local.sh && ./start-local.sh
#
# It will:
#   1. Initialize git (first run only) and make an initial commit.
#   2. Create a local .env from the example (first run only).
#   3. Build the Docker images and start db + api + web.
#   4. Seed the first admin + sample content.
# Re-running is safe — your database data is preserved in the edvax_pgdata volume.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/4] Git version control"
if [ ! -d .git ]; then
  git init -q
  git add -A
  git commit -q -m "Initial commit: EDVAX platform (frontend, backend, Docker)" || true
  echo "    git repo initialized + initial commit made."
else
  echo "    git already initialized — skipping."
fi

echo "==> [2/4] Local environment file"
if [ ! -f .env ]; then
  cp .env.local.example .env
  echo "    created .env from .env.local.example (safe local defaults)."
else
  echo "    .env already exists — keeping yours."
fi

echo "==> [3/4] Building + starting containers (this can take a few minutes the first time)"
docker compose up -d --build

echo "    waiting for the database to be healthy…"
sleep 8

echo "==> [4/4] Seeding first admin + sample content"
docker compose exec -T api node src/db/seed.js || {
  echo "    (seed will retry once the API is up — re-run: docker compose exec api node src/db/seed.js)"
}

echo ""
echo "============================================================"
echo " EDVAX is starting up."
echo "   Public site : http://localhost:8080"
echo "   Admin panel : http://localhost:8080/admin"
echo "   Admin login : admin@edvax.local  /  admin12345"
echo ""
echo " Useful commands:"
echo "   docker compose ps           # see running services"
echo "   docker compose logs -f      # tail logs"
echo "   docker compose down         # stop (DATA IS KEPT)"
echo "   docker compose down -v      # stop AND erase the database"
echo "============================================================"
