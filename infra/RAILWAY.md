Deployment notes (staging):

1) Services
- API (Node 20) with env:
  - DATABASE_URL
  - AWS_S3_ENDPOINT / AWS_S3_FORCE_PATH_STYLE
  - S3_BUCKET_US / S3_BUCKET_EU
  - ACCOUNT_REGION_DEFAULT=us
  - STRICT_AUTH=true (for staging)
  - WEB_ORIGIN=https://staging.example.com
  - SENTRY_DSN=(optional)
- Postgres (Railway plugin)
- MinIO/S3 (optional for staging)

2) Build
- pnpm install --frozen-lockfile
- pnpm -r build
  - services/api: node dist/migrate.js && node dist/index.js

3) Health
- GET /health returns ok

4) Metrics
- GET /metrics exposed for Prometheus (protect with IP allowlist in staging)

## Railway + Cloudflare R2 (Option A)

This deploys the API on Railway (Docker) with a managed Postgres, and uses Cloudflare R2 (S3-compatible) for blob storage.

### 1) Provision
- Railway: create a new project
- Add Postgres plugin (copy the `DATABASE_URL`)
- Enable deployments from GitHub repo or use CLI
- Cloudflare: create two R2 buckets (you can use one for both regions initially)

### 2) Environment variables (Railway > Variables)
- Core
  - `DATABASE_URL` (from Railway Postgres)
  - `NODE_ENV=production`
  - `PORT=3001`
  - `STRICT_AUTH=true`
  - remove/unset `DEV_AUTH_BYPASS`
- Clerk
  - `CLERK_SECRET_KEY=sk_live_xxx`
  - (Web app) `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx`
- Regions/Buckets
  - `AWS_REGION=auto` or `us-east-1`
  - `S3_BUCKET_US=arqivo-us` (R2 bucket)
  - `S3_BUCKET_EU=arqivo-eu` (R2 bucket)
- R2 endpoint and auth
  - `AWS_S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com`
  - `AWS_S3_FORCE_PATH_STYLE=true`
  - `AWS_ACCESS_KEY_ID=...`
  - `AWS_SECRET_ACCESS_KEY=...`
- Optional caps/rate
  - `MAX_BLOB_BYTES=50000000`
  - `RATE_CAPACITY=100`
  - `RATE_REFILL=50`

### 3) Deploy API (Docker)
Service settings:
- Build: Dockerfile at `services/api/Dockerfile`
- Root directory: repo root
- Port: `3001`
- Health path: `/health`
- Postdeploy (optional): `pnpm --filter @arqivo/api migrate`

### 4) Migrate (once per environment)
Run in Railway shell:
```bash
pnpm --filter @arqivo/api migrate
```

### 5) Smoke tests
```bash
API="https://<railway-service-url>"
FILE=/etc/hosts
HASH=$(openssl dgst -sha256 -binary "$FILE" | xxd -p -c 256)

# 1) unauth should 401
curl -i -X PUT "$API/v1/blobs/$HASH" -H 'content-type: application/octet-stream' --data-binary @"$FILE"

# 2) auth should 200/204 (replace $TOKEN)
curl -i -X PUT "$API/v1/blobs/$HASH" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/octet-stream' \
  -H "x-cipher-hash: sha256:$HASH" \
  --data-binary @"$FILE"

# 3) caps and allowlist
dd if=/dev/zero bs=1024 count=1100 of=/tmp/meta.cbor >/dev/null 2>&1
curl -i -X PUT "$API/v1/metadata/doc-oversize" -H 'content-type: application/cbor' --data-binary @/tmp/meta.cbor

# 4) request-id
curl -is "$API/health" | grep -i x-request-id
```

### Notes
- R2 buckets are private by default; ensure correct access keys and no public lists.
- If using Cloudflare account-level R2 with custom domains, adjust endpoint accordingly.
- Keep using the content-addressed flow for blobs; headers must include `x-cipher-hash: sha256:<hash>`.


