#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/huanyukuntaichem/current"

cd "$APP_DIR"
git pull --ff-only origin main
npm ci
npm --workspace frontend run build
pm2 startOrReload deployment/ecosystem.config.cjs --update-env
pm2 save
