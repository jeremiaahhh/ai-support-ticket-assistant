#!/usr/bin/env bash
# Upload demo tickets to a running backend and trigger AI analysis for each.
#
# Usage:
#   bash scripts/seed.sh                  # http://localhost:8000
#   API_BASE=http://my-host:8000 bash scripts/seed.sh

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEED_FILE="$ROOT/seed/demo_tickets.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "✗ jq is required. Install it (e.g. brew install jq) and try again." >&2
  exit 1
fi

echo "→ Seeding $API_BASE from $SEED_FILE"

for attempt in $(seq 1 30); do
  if curl -sf "$API_BASE/health" >/dev/null; then
    break
  fi
  echo "  ...waiting for backend (attempt $attempt/30)"
  sleep 1
done

count=$(jq 'length' "$SEED_FILE")
echo "  uploading $count tickets…"

for i in $(seq 0 $((count - 1))); do
  body=$(jq ".[$i]" "$SEED_FILE")
  subject=$(echo "$body" | jq -r .subject)
  response=$(curl -sf -X POST "$API_BASE/tickets" \
    -H "Content-Type: application/json" \
    -d "$body")
  id=$(echo "$response" | jq -r .id)
  echo "  + $subject  (id=$id)"
  curl -sf -X POST "$API_BASE/tickets/$id/analyze" \
    -H "Content-Type: application/json" -d '{"force": false}' >/dev/null
done

echo "✓ Seed complete. Open the dashboard to see live data."
