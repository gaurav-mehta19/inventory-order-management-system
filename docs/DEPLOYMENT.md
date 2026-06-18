# Deployment Guide

## Overview

Three containers orchestrated by Docker Compose:

| Service    | Image base            | Port | Notes                                  |
| ---------- | --------------------- | ---- | -------------------------------------- |
| `postgres` | postgres:16-alpine    | 5432 | Named volume `postgres_data`           |
| `backend`  | python:3.12-slim      | 8000 | Multi-stage, non-root, healthcheck     |
| `frontend` | node:22 → nginx:alpine| 8080 | Static build served by Nginx, non-root |

All services share a private bridge network, declare health checks, and use
`restart: unless-stopped`. The backend waits for Postgres to be healthy; the frontend waits for the
backend.

## 1. Configure

For local and demo use, no configuration is required — `docker-compose.yml` defines working values
(credentials, ports, `SEED_ON_START`, etc.) and runs out of the box.

For any non-local deployment, change the credentials and settings in `docker-compose.yml` — or, to
keep secrets out of the file, replace the literals with `${VAR}` and supply them from your platform's
secret manager or a `compose.override.yml`:

```yaml
# compose.override.yml (not committed)
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  backend:
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:${POSTGRES_PASSWORD}@postgres:5432/inventory
      CORS_ORIGINS: https://your-domain.com
      SEED_ON_START: 'false'
```

## 2. Build & launch

```bash
docker compose up --build -d
docker compose ps       # verify all services are healthy
```

The backend entrypoint runs `alembic upgrade head` automatically before serving. `SEED_ON_START`
defaults to `true` so the demo has data immediately; set it to `false` in production.

## 3. Verify

```bash
curl -fsS http://localhost:8000/health        # {"status":"ok"}
curl -fsS http://localhost:8000/health/ready   # {"status":"ready"} (DB reachable)
curl -fsS http://localhost:8080/healthz        # ok
```

Open the dashboard at `http://localhost:8080`.

## 4. Operations

```bash
docker compose logs -f                                          # tail all services
docker compose exec backend alembic upgrade head               # re-run migrations
docker compose exec postgres pg_dump -U postgres inventory > backup.sql   # backup
docker compose down                                            # stop (keeps data)
docker compose down -v                                         # stop + drop the database volume
```

## Production hardening checklist

- [ ] Replace default Postgres credentials with managed secrets.
- [ ] Terminate TLS at a reverse proxy / load balancer in front of Nginx.
- [ ] Restrict `CORS_ORIGINS` to your real domains.
- [ ] Point `DATABASE_URL` at a managed Postgres with automated backups and PITR.
- [ ] Ship structured logs (`LOG_JSON=true`) to your aggregator and alert on `error`/`5xx`.
- [ ] Scale the backend horizontally (`UVICORN_WORKERS`, or more replicas behind the proxy).
- [ ] Set container resource limits and configure liveness/readiness probes if on Kubernetes.

## Kubernetes notes

The images are stateless and 12-factor, so they map cleanly to Deployments:

- Use `/health` for liveness and `/health/ready` for readiness probes on the backend.
- Run `alembic upgrade head` as an init container or a one-shot Job instead of on every pod start.
- Externalise configuration with ConfigMaps/Secrets.
