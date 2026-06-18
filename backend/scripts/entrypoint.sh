#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations..."
alembic upgrade head

if [[ "${SEED_ON_START:-false}" == "true" ]]; then
  echo "Seeding database..."
  python -m scripts.seed || echo "Seed skipped (data may already exist)"
fi

echo "Starting API server..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers "${UVICORN_WORKERS:-2}"
