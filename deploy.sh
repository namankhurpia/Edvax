#!/usr/bin/env bash
# EDVAX deploy / update script. Safe to re-run — never wipes data.
# Usage on the server (inside the project dir, with a filled-in .env):
#   ./deploy.sh           # build + (re)start everything
#   ./deploy.sh seed      # also create the first admin + sample content
#   ./deploy.sh backup    # dump the database to ./backups/
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example to .env and fill it in."
  exit 1
fi

CMD="${1:-up}"

case "$CMD" in
  up)
    echo "==> Building images…"
    docker compose build
    echo "==> Starting services (DB volume edvax_pgdata is preserved)…"
    docker compose up -d
    echo "==> Done. Migrations ran automatically on API boot."
    docker compose ps
    ;;
  seed)
    echo "==> Seeding first admin + sample content…"
    docker compose exec api node src/db/seed.js
    ;;
  backup)
    mkdir -p backups
    TS=$(date +%Y%m%d_%H%M%S)
    # shellcheck disable=SC1091
    source .env
    echo "==> Dumping database to backups/edvax_${TS}.sql"
    docker compose exec -T db pg_dump -U "${POSTGRES_USER:-edvax}" "${POSTGRES_DB:-edvax}" > "backups/edvax_${TS}.sql"
    echo "==> Backup complete."
    ;;
  logs)
    docker compose logs -f --tail=100
    ;;
  *)
    echo "Unknown command: $CMD (use: up | seed | backup | logs)"
    exit 1
    ;;
esac
