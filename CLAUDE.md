# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Pokemon card damage analyzer. Users upload a card image; it gets stored in MinIO, queued via RabbitMQ, analyzed by a processing service, and results are pushed back to the browser over SSE. The frontend is Nuxt 3.

## Architecture

```
Browser (Nuxt 3)
  → POST /upload        → upload-service (Go, port 8080)
                              → stores image in MinIO
                              → enqueues job in RabbitMQ
                              → creates job row in Postgres
  ← GET /events/:job_id ← notification-service (port 8081)
                              ← reads job updates from Redis pub/sub

processing-service (no HTTP port, consumes RabbitMQ)
  → fetches image from MinIO
  → runs damage detection (tears, water damage, creases)
  → writes annotated image back to MinIO
  → updates job row in Postgres
  → publishes result to Redis
```

Infrastructure (all via Docker Compose):
- **Postgres** `localhost:5432`, db `pokemon_processor` — job status and results
- **RabbitMQ** `localhost:5672`, management UI `localhost:15672` — work queue
- **Redis** `localhost:6379` — pub/sub channel between processing and notification service
- **MinIO** `localhost:9000`, console `localhost:9001` — object storage for card images; bucket `pokemon-cards` is public

## Running Everything

```bash
docker compose up --build     # start all services
docker compose up -d          # start in background
docker compose logs -f <svc>  # tail logs for one service
```

The `services/` subdirectories (upload-service, processing-service, notification-service) are currently empty stubs — they need to be implemented before `docker compose up --build` will succeed.

## Frontend (Nuxt 3)

```bash
cd frontend
npm install
npm run dev       # dev server on http://localhost:3000
npm run build     # production build
```

Environment (all have localhost defaults in `nuxt.config.ts`):
- `NUXT_PUBLIC_UPLOAD_URL` — upload-service base URL
- `NUXT_PUBLIC_NOTIFICATION_URL` — notification-service base URL
- `NUXT_PUBLIC_STORAGE_URL` — MinIO public URL for serving images

Key frontend files:
- `pages/index.vue` — single page: drag-and-drop upload, status polling, damage report display
- `composables/useJobStatus.ts` — SSE client; listens on `GET /events/:job_id` for `job_update` and `done` events

## Data Flow Details

1. `POST /upload` returns `{ job_id: string }`
2. Frontend opens `EventSource` to `GET /events/:job_id`
3. notification-service emits `job_update` events: `{ status, annotated_image_url, original_image_url, damage_report, error }`
4. `damage_report` shape: `{ total_issues, condition, issues: [{ type, label, confidence, bbox }] }`
5. Condition values used in UI: `Mint`, `Good`, `Played`, `Damaged`
