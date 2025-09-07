## Arqivo — Production Readiness Checklist (v0 → prod)

Status legend: [ ] TODO  [~] In progress  [x] Done

### 1) Authentication (strict mode)
- [ ] Disable `DEV_AUTH_BYPASS` in staging/prod; require Clerk on all routes except `/health` and `/metrics`.
- [ ] Add regression tests:
  - [ ] Unauthenticated `PUT /v1/blobs/:id` → 401
  - [ ] Unauthenticated `POST /v1/devices/register` → 401

### 2) Tests (happy-path + errors)
- [ ] devices/register idempotency (same key → same device or 409 by design)
- [ ] blob integrity: wrong `x-cipher-hash` → 400 (code: `bad_hash`)
- [ ] quota counters update after blob upload
- [ ] index shard size > 5MB → 413 (code: `index_shard_too_large`)
- [ ] metadata size > 1MB → 413 (code: `metadata_too_large`)
- [ ] content-address ID mismatch → 409 (code: `id_mismatch`)
- [ ] multipart: init → part → complete → GET blob roundtrip

### 3) CI/CD
- [ ] GitHub Actions workflow:
  - [ ] Lint + typecheck (pnpm -r typecheck, lint)
  - [ ] Start Docker Postgres (5433) + S3 mock (e.g., Localstack or MinIO)
  - [ ] Run migrations
  - [ ] Run integration tests (incl. 1MB upload/download smoke)
  - [ ] Cache pnpm store

### 4) Storage policies (S3)
- [ ] Enable `BlockPublicAcls=true`, `IgnorePublicAcls=true`
- [ ] (Optional) Object Lock – compliance mode (non-production buckets at first)
- [ ] Lifecycle: purge unreferenced multipart/incomplete uploads after N days
- [ ] Versioning enabled; lifecycle for old versions if desired

### 5) Chunked uploads: client contract
- [ ] Document max/min part size; concurrency; retry/backoff; resume semantics
- [ ] Client implements retry with exponential backoff and idempotent part uploads

### 6) Rate limiting
- [ ] Per-account token bucket (Redis or in-memory w/ leaky-bucket) covering:
  - [ ] PUT blobs
  - [ ] multipart part uploads
  - [ ] metadata/index PUT

### 7) Tracing/observability
- [ ] Request-id correlation header; include in all errors
- [ ] OpenTelemetry traces (HTTP server span + S3 calls) → exporter (OTLP)

### 8) Docs & runbooks
- [ ] README Quickstart: Docker Pg (5433), envs, build, run, tests
- [ ] Security model doc: E2EE, account-scoped keys, content-address IDs
- [ ] Incident runbook: storage outage, DB outage, auth outage

### 9) Release gates
- [ ] Staging smoke: 1MB blob upload/download + metadata/index roundtrip
- [ ] Staging perf: P50 upload <3s (single page), P50 query <1.5s (2k docs)
- [ ] Audit log sampling verified in staging

### Notes
- Current state (implemented): ciphertext-only endpoints; idempotency; integrity headers; per-account region keys; DB schema (accounts/quotas/devices/documents/audit_logs); metrics; error taxonomy; audit logging; multipart endpoints; size limits.


