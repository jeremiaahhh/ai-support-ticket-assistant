# Backend — FastAPI support ticket service

Layered FastAPI app powering the Support Ticket Triage. See the
[root README](../README.md) and [`docs/architecture.md`](../docs/architecture.md)
for the full picture.

## Local development

```bash
cp .env.example .env
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

`http://localhost:8000/docs` opens the interactive OpenAPI explorer.

## Tests

```bash
pytest -q
```

Tests use SQLite and the mock provider, so no Postgres or external API keys
are required.

## Folder layout

```
app/
  api/routes/      → thin HTTP adapters
  core/            → config, logging, error handling
  db/              → engine + session
  models/          → SQLAlchemy ORM
  repositories/    → DB access
  schemas/         → Pydantic schemas
  services/        → ticket / analysis / llm / analytics / seed
  main.py          → FastAPI app factory + lifespan
tests/             → pytest suite (14 tests)
```
