# 13 - Server Safety

## Project Isolation

Use only:

- `/var/www/huanyukuntaichem/current`
- project-specific PM2 app `huanyukuntaichem-frontend`
- project-specific Docker containers prefixed `huanyukuntai`

## Forbidden Operations

- Do not run `killall node`.
- Do not run `pm2 delete all`.
- Do not run `docker system prune -a`.
- Do not run `docker compose down -v` unless a project backup and explicit approval exist.
- Do not modify unrelated services under `/opt/openclaw`, `/opt/hermes`, or other project directories.

## Backup Rule

Before destructive server changes, create a timestamped backup of relevant project files and database volumes.
