#!/usr/bin/env bash
# backend/directus/schema/preflight-readonly.sh
#
# Read-only preflight for huanyukuntaichem.com
#
# Queries:
#   - Git HEAD + worktree status
#   - Docker labels (Compose Project / Service / Config Files)
#   - Container names
#   - Network names
#   - Directus version
#   - Node version
#   - Postgres version
#
# Does NOT modify anything.
# Does NOT log secrets.

set -e

REPO_ROOT="${REPO_ROOT:-/opt/websites/huanyukuntaichem-site/repo}"

echo "================================================"
echo "READ-ONLY PREFLIGHT — huanyukuntaichem.com"
echo "================================================"
echo

echo "--- Git ---"
echo "Local HEAD:    $(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo N/A)"
echo "Worktree:      $(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | wc -l) modified files"
echo

echo "--- Docker (huanyukuntaichem containers) ---"
for c in huanyukuntaichem-directus huanyukuntaichem-postgres; do
  echo "  $c:"
  docker inspect "$c" 2>/dev/null | python3 -c "
import json, sys
d = json.load(sys.stdin)[0]
print(f'    Compose Project: {d[\"Config\"][\"Labels\"].get(\"com.docker.compose.project\", \"N/A\")}')
print(f'    Compose Service: {d[\"Config\"][\"Labels\"].get(\"com.docker.compose.service\", \"N/A\")}')
print(f'    ProjectConfigFiles: {d[\"Config\"][\"Labels\"].get(\"com.docker.compose.project.config_files\", \"N/A\")}')
print(f'    Mounts:')
for m in d.get('Mounts', []):
    print(f'      - {m[\"Source\"]} -> {m[\"Destination\"]}')
" 2>/dev/null || echo "    (container not found)"
done

echo "--- Network ---"
docker network inspect huanyukuntaichem-network --format '  Network: {{.Name}} Driver: {{.Driver}}' 2>/dev/null || echo "  (network not found)"

echo "--- Directus container versions ---"
echo "  Directus: $(docker exec huanyukuntaichem-directus cat /directus/package.json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin).get(\"version\",\"N/A\"))')"
echo "  Node:     $(docker exec huanyukuntaichem-directus node --version 2>/dev/null)"
echo "  Postgres: $(docker exec huanyukuntaichem-postgres psql --version 2>/dev/null | awk '{print $3}')"

echo "--- Legacy volumes (external mounts, actual owner = huanyukuntaichem) ---"
docker volume ls --filter "name=huanyukuntai" --format "  {{.Name}}" 2>/dev/null || true

echo "--- Rollback target scope (only these 2) ---"
echo "  huanyukuntaichem-directus"
echo "  huanyukuntaichem-postgres"

echo "================================================"
echo "DONE. No state changes."
echo "================================================"