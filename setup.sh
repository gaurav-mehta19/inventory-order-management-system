#!/usr/bin/env bash
set -euo pipefail

# Generates the env files for local (non-Docker) development from their
# committed .env.example templates:
#   backend/.env   → backend config (uvicorn on the host)
#   frontend/.env  → frontend config (vite dev server)
# Docker Compose does not need these — it defines its own values.
# Both are gitignored; the .env.example templates are the source of truth.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FORCE="false"
if [[ "${1:-}" == "--force" ]]; then
  FORCE="true"
fi

copy_env() {
  local example="${ROOT_DIR}/$1"
  local target="${ROOT_DIR}/$2"
  if [[ ! -f "${example}" ]]; then
    echo "  ! missing ${1} — cannot generate ${2}" >&2
    exit 1
  fi
  if [[ -f "${target}" && "${FORCE}" != "true" ]]; then
    echo "  • ${2} already exists — skipping (use --force to overwrite)"
    return
  fi
  cp "${example}" "${target}"
  echo "  ✓ wrote ${2}"
}

echo "Generating environment files from .env.example..."
copy_env "backend/.env.example" "backend/.env"
copy_env "frontend/.env.example" "frontend/.env"

cat <<'EOF'

Done. Next steps:

  Run everything with Docker (recommended — no env files needed):
    docker compose up --build

    Frontend  → http://localhost:8080
    API docs  → http://localhost:8000/docs

  Or run locally (uses the env files generated above):
    backend   → cd backend && python -m venv .venv && source .venv/bin/activate \
                  && pip install -r requirements-dev.txt && alembic upgrade head \
                  && uvicorn src.main:app --reload
    frontend  → cd frontend && npm install && npm run dev
EOF
