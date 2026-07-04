#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/websites/huanyukuntaichem-site"
CURRENT_DIR="$APP_ROOT/current"
RELEASES_DIR="$APP_ROOT/releases"
COMMIT_SHA="${1:-}"

if [ -z "$COMMIT_SHA" ]; then
  echo "Usage: deploy-vps.sh <commit-sha>" >&2
  exit 1
fi

ARCHIVE="$RELEASES_DIR/$COMMIT_SHA.tar.gz"
WORK_DIR="$RELEASES_DIR/work-$COMMIT_SHA"

if [ ! -f "$ARCHIVE" ]; then
  echo "Deployment archive not found: $ARCHIVE" >&2
  exit 1
fi

mkdir -p "$APP_ROOT/backups" "$RELEASES_DIR"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
tar -xzf "$ARCHIVE" -C "$WORK_DIR"

cd "$WORK_DIR"
npm ci
npm --workspace frontend run build

if [ -d "$CURRENT_DIR" ] && [ "$(find "$CURRENT_DIR" -mindepth 1 -maxdepth 1 | wc -l)" -gt 0 ]; then
  BACKUP_DIR="$APP_ROOT/backups/before-$COMMIT_SHA-$(date +%Y%m%d%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  tar \
    --exclude='./node_modules' \
    --exclude='./frontend/node_modules' \
    --exclude='./frontend/.next' \
    --exclude='./logs' \
    --exclude='./frontend/logs' \
    --warning=no-file-changed \
    -C "$CURRENT_DIR" \
    -czf "$BACKUP_DIR/current.tar.gz" . || echo "Backup completed with non-fatal file change warnings."
fi

pm2 stop huanyukuntaichem-frontend || true
rm -rf "$CURRENT_DIR"
mv "$WORK_DIR" "$CURRENT_DIR"
cd "$CURRENT_DIR"
pm2 startOrReload deployment/ecosystem.config.cjs --update-env
pm2 save
