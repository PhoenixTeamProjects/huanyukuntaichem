# Backend

This folder contains the Directus/PostgreSQL deployment skeleton for this project.

Important: the VPS already has existing `huanyukuntai` Directus/PostgreSQL containers running on `127.0.0.1:8055`. Do not run this Compose file on the VPS until the existing containers, volumes, backups, and Directus admin access have been audited.

Use `backend/.env.example` only as a template. Real backend credentials must stay on the server and out of Git.
