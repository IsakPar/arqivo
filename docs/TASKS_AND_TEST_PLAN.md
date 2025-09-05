## Arqivo — v0 Task Breakdown and Comprehensive Test Plan

Last updated: 2025‑09‑05

### Objective
- Deliver cloud‑first, zero‑knowledge document vault for iOS + Web with Clerk auth, encrypted uploads (blobs + metadata + index), natural‑language chat recall, and recovery. Prepare region routing now (default `us`), activate multi‑region in v1.

---

## v0 Task Breakdown (Milestones)

### Milestone A — Foundations (Week 1)
- Monorepo setup
  - Create `apps/ios`, `apps/web`, `services/api`, `packages/crypto`, `packages/shared`, `docs/`.
  - Coding standards, commit hooks, linting, formatting, type checks.
- Cloud + data
  - Provision S3 bucket `arqivo-us` (and reserve `arqivo-eu`). SSE enabled.
  - Postgres schema: `accounts`, `devices`, `quota`, `regions`.
  - Region readiness: persist `region_code` on account; object keys prefixed `r/{region}/…`.
- Identity
  - Integrate Clerk in Web and API; map `clerk_user_id → account_id`.
  - Session verification endpoint; server middleware for authorization.
- Observability & Ops
  - Structured logging (no PII), request IDs, metrics (anonymous), health checks.
  - Environments: local, staging, prod; secrets management.

Acceptance
- Web sign‑in via Clerk works; API verifies token and issues `account_id`.
- DB migrations run; S3 write/read tested from staging; keys use `r/us/...`.

### Milestone B — Client Crypto & Recovery (Week 1–2)
- `packages/crypto`
  - libsodium wrappers: X25519/Ed25519, AES‑256‑GCM, HKDF.
  - BIP‑39 recovery phrase (EN), Argon2id parameters with device‑class presets.
  - Streaming encryption for large files (chunk size 1–4MB), per‑chunk nonce derivation.
  - CBOR envelope schemas for metadata and index shards (versioned).
- Recovery
  - Generate `K_v`; wrap per device and with recovery phrase; store encrypted recovery blob.
  - Recovery flow on a fresh device.

Acceptance
- Crypto unit + property tests pass (tamper, nonce uniqueness, round‑trip, cross‑device wrap/unlock).
- Recovery round‑trip succeeds on iOS and Web using fixtures.

### Milestone C — API & Storage (Week 2)
- REST endpoints
  - `POST /v1/devices/register`, `PUT/GET /v1/blobs/{id}`, `PUT/GET /v1/metadata/{doc_id}`, `PUT/GET /v1/index/{shard_id}`, `GET /v1/quota`.
  - Validate sizes, content types, integrity (hash of ciphertext), idempotency.
- Storage service
  - Region‑aware S3 client; content addressing for blobs; no cross‑user dedup.
  - Padded size buckets for billing (internal only in v0).

Acceptance
- API integration tests green; region prefixes observed; quotas updated.

### Milestone D — iOS Capture → Upload (Week 2–3)
- Capture & processing
  - SwiftUI camera with auto‑crop/de‑skew; Vision OCR.
  - Core ML NER/classification; embeddings (int8) per page/snippet.
- Encrypt & upload
  - Encrypt bytes with `K_d`; bundle metadata+index with `K_v`.
  - Upload all ciphertext artifacts; background transfers; retry/backoff.
- Viewer & chat
  - Local cache; chat query UI; open doc with highlights.

Acceptance
- Single‑page receipt captured → visible on Web within seconds; fields extracted correctly on device.

### Milestone E — Web Upload & Chat (Week 3–4)
- Uploads
  - Drag‑drop; image/PDF ingestion; WASM OCR fallback; embeddings.
  - Encrypt → upload blobs, metadata, index shards.
- Chat recall
  - Query parsing; compute query embedding; fetch/decrypt shards; brute‑force cosine; rank; filters; open doc.

Acceptance
- Query “my MacBook Air receipt” returns top‑1 correct within <1.5s median over ~2k docs.

### Milestone F — Hardening & UX Polish (Week 4–6)
- Reliability
  - Offline queueing; resume uploads; exponential backoff; cancellation.
  - Background indexing throttling; battery/network heuristics.
- Security & privacy
  - Size padding; zero content logs; redaction; rate limiting.
- Recovery & devices
  - Recovery UX; QR device link (ephemeral X25519); device removal.
- Accessibility & perf
  - VoiceOver/ARIA; large text; cold‑start time; memory profiling; error surfaces.

Acceptance
- Offline tests pass; recovery and device link flows verified; accessibility checks baseline green.

---

## Test Strategy

### Test Levels
- Unit: pure functions and crypto primitives.
- Integration: components across boundaries (client crypto ↔ API ↔ S3).
- E2E: user flows (sign‑in, capture/upload, chat recall, recovery).
- Property‑based: crypto invariants, stream encryption, schema round‑trips.
- Performance: latency budgets (capture→upload, query times), memory/CPU.
- Security/Privacy: zero‑knowledge guarantees, key handling, logging redaction.
- Reliability/Offline: queueing, retries, conflict handling, resumable transfers.
- Compatibility: iOS devices, Safari/Chrome/Edge; network variability.
- Accessibility: VoiceOver, keyboard nav, color contrast.

### Tooling
- iOS: XCTest + XCUITest; unit and UI automation.
- Web: Vitest/Jest for unit; Playwright for E2E.
- API: Supertest/REST client; contract tests (OpenAPI if adopted).
- Property tests: fast‑check (TS) and SwiftCheck (Swift).
- Performance: k6/Artillery for API; Playwright trace + custom timers for client.
- Security: dependency audit, SAST, secret scanning; reproducible build checks for crypto package.

### Environments & Data
- Fixtures: 50 mixed docs (receipts, IDs, warranties, contracts), including Apple Store “MacBook Air” receipt.
- Synthetic corpus: 2k docs generated with templated variation; balanced across types and dates.
- Environments: local (dev), staging (CI), production; per‑region buckets prepared; staging uses `us`.

---

## Defined Test Suites and Cases

### 1) Crypto Module (CRYPTO‑###)
- CRYPTO‑001: AES‑GCM round‑trip success for random payloads (1KB, 1MB, 100MB chunked).
- CRYPTO‑002: Tamper detection — single‑bit flip causes decryption failure with explicit error.
- CRYPTO‑003: Nonce uniqueness across chunks — HKDF(`K_d`, chunk_index) yields no reuse; detect duplicates in randomized runs.
- CRYPTO‑004: Cross‑device wrap/unlock — `K_v` wrapped for Device A cannot decrypt on Device B without rewrap.
- CRYPTO‑005: Recovery wrap/unlock — 12‑word phrase derives key; rewrap `K_v`; unlock on fresh device.
- CRYPTO‑006: Argon2id parameter enforcement — rejects parameters below floor; measures runtime budget.
- CRYPTO‑007: CBOR envelope schema versioning — forward/backward compatibility; rejects unknown critical fields.
- CRYPTO‑008: Integrity of content addressing — server‑stored hash(ciphertext) matches computed client hash.
- CRYPTO‑009: Streaming encryption — chunk boundaries arbitrary; joined plaintext reconstructs exactly.
- CRYPTO‑010: Large file memory bound — peak memory stays within budget during stream encryption.

### 2) API & Storage (API‑###)
- API‑001: Clerk JWT verification — valid token accepted; invalid/expired rejected with 401.
- API‑002: Device registration — stores pubkey; returns `device_id`; idempotent.
- API‑003: Blob PUT/GET — upload/download ciphertext; ETag/integrity verified.
- API‑004: Metadata PUT/GET — encrypted bundle accepted; size limits enforced; no plaintext fields allowed.
- API‑005: Index PUT/GET — shards accepted and retrievable; correct content‑type.
- API‑006: Quota counting — byte/doc counters update atomically per upload.
- API‑007: Region prefix — all keys start with `r/us/...` in v0.
- API‑008: Idempotency — repeated PUT with same object id is safe; returns consistent status.
- API‑009: Rate limiting — abusive clients throttled; honest flows unaffected.
- API‑010: Logging redaction — no secrets, keys, or plaintext bytes in logs.

### 3) iOS Client (IOS‑###)
- IOS‑001: Camera capture → auto‑crop/de‑skew works on angled receipt.
- IOS‑002: OCR accuracy — merchant, total, date extracted for Apple receipt fixture.
- IOS‑003: NER/classifier typing — “receipt” type with confidence ≥ threshold.
- IOS‑004: Embedding generation — stable dimension, normalized vectors; deterministic within tolerance.
- IOS‑005: Encrypt→upload pipeline — all artifacts uploaded; retries on flaky network.
- IOS‑006: Chat recall — NL query returns correct doc top‑1 for 2k corpus median <1.5s.
- IOS‑007: Offline queue — capture offline; uploads resume; no data loss.
- IOS‑008: Recovery — restore on fresh device with 12‑word phrase; access all docs.

### 4) Web Client (WEB‑###)
- WEB‑001: Clerk sign‑in across Chrome/Safari/Edge; session persisted securely.
- WEB‑002: Drag‑drop upload; image + PDF ingestion paths; WASM OCR fallback.
- WEB‑003: Encryption pipeline — no plaintext leaves browser; network inspector shows ciphertext only.
- WEB‑004: Chat recall — NL query top‑1 correct for 2k corpus; filters function offline on cached shards.
- WEB‑005: Accessibility — keyboard navigation of chat; screen reader labels present.

### 5) Search & Index (SEARCH‑###)
- SEARCH‑001: Query embedding quality — cosine similarity ranks exact match top‑1.
- SEARCH‑002: Temporal hints — “four years ago” biases doc_date window correctly.
- SEARCH‑003: Disambiguation — “Apple warranty” vs “Apple Store receipt” ranks appropriate top.
- SEARCH‑004: Filters — type/date/entity filters narrow results deterministically.
- SEARCH‑005: Cold‑start — fetch missing shards, decrypt, search within budget.

### 6) Region & Storage (REGION‑###)
- REGION‑001: All object keys prefixed with `r/us/` in v0; verified in S3.
- REGION‑002: Account region settable (UI default `us`); stored in DB.
- REGION‑003: Future switch readiness — storage abstraction uses region to route; unit tests simulate `eu`.

### 7) Recovery & Devices (REC‑###)
- REC‑001: Recovery phrase generation and display — checksum valid; copy/export secured.
- REC‑002: Recovery flow — decrypts `K_v` on new device; no server secrets involved.
- REC‑003: Device link via QR — ephemeral X25519 handshake; `K_v` rewrapped; old device notifies success.
- REC‑004: Device removal — rewrap or maintain `K_v` policy validated; removed device can no longer decrypt.

### 8) Reliability & Offline (REL‑###)
- REL‑001: Upload retry/backoff — transient 5xx recovers; final failure surfaces actionable error.
- REL‑002: Resume interrupted uploads — partial chunks continue; no duplication.
- REL‑003: Local cache eviction — respects size limits; MRU policy; no crash.

### 9) Security & Privacy (SEC‑###)
- SEC‑001: No plaintext anywhere — interceptors verify network traffic is ciphertext only.
- SEC‑002: Key material never logged — redaction tests on client/server logs.
- SEC‑003: Clipboard leaks — recovery phrase masked; copy warning; no background snapshots on iOS.
- SEC‑004: Dependency audit — no known critical CVEs in release.
- SEC‑005: Static analysis — crypto misuse patterns absent; lint rules enforced.
- SEC‑006: Reproducible crypto package build — hash matches CI; tamper evident.
- SEC‑007: TLS pinning (iOS optional) — validates cert chain; fallback behavior defined.

### 10) Performance & Load (PERF‑###)
- PERF‑001: Capture→encrypted→uploaded under 3s median on 4G single‑page.
- PERF‑002: Query median <1.5s for 2k docs; p95 <3s; p99 <5s.
- PERF‑003: Memory footprint — web tab <400MB during 2k search; iOS app within device budget.
- PERF‑004: CPU budget — sustained utilization under thresholds; no thermal throttling in typical session.
- PERF‑005: Index shard fetch size — respects bandwidth caps; caching effective.

---

## CI/CD and Quality Gates
- Pipelines
  - Lint, type‑check, unit + property tests on every PR.
  - Integration tests against ephemeral staging (DB + S3 sandbox).
  - Playwright + XCUITest E2E nightly and on release candidates.
  - Performance smoke on PR (small corpus) and full perf nightly (2k corpus).
- Gates (block merge if failing)
  - 100% pass on CRYPTO and API suites.
  - E2E core flows (sign‑in, upload, recall, recovery) green.
  - Performance: capture→upload median ≤3s; query median ≤1.5s.
  - Security: dependency audit no criticals; no secret leaks; no plaintext findings.

---

## Release Readiness Checklist (v0)
- All acceptance criteria met per milestone.
- Test dashboards green for last 7 days.
- Recovery flows validated on real devices.
- Rollback plan documented; feature flags for risky areas.
- Incident runbooks and support playbook (no access to content, logs are non‑sensitive).

---

## Ownership
- iOS: Capture, OCR/NER, encryption pipeline, chat UI.
- Web: Uploads, WASM OCR, encryption pipeline, chat UI.
- Crypto package: Keys, envelopes, recovery.
- API/Storage: Endpoints, region routing, quotas, logs.
- QA/Perf: Test harnesses, Playwright/XCUITest, perf suites, dashboards.


