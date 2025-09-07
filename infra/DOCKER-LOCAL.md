## Local Docker stack (Postgres + MinIO + API)

This stack runs everything locally with Docker Compose: Postgres, MinIO (S3-compatible), and the API.

### Start
```bash
docker compose up -d --build
```

Services:
- Postgres: `localhost:5433` (db: `arqivo`, user/pass: `postgres/postgres`)
- MinIO Console: `http://localhost:9001` (user: `minioadmin`, pass: `minioadminsecret`)
- MinIO S3 endpoint: `http://localhost:9000`
- API: `http://localhost:3001`

Buckets are created automatically (`arqivo-us`, `arqivo-eu`) with versioning enabled.

### Migrate (if needed)
```bash
docker compose exec api node dist/migrate.js
```

### Smoke tests
```bash
API="http://localhost:3001"
FILE=/etc/hosts
HASH=$(openssl dgst -sha256 -binary "$FILE" | xxd -p -c 256)

# unauth allowed in local (DEV_AUTH_BYPASS=1)
curl -i -X PUT "$API/v1/blobs/$HASH" \
  -H 'content-type: application/octet-stream' \
  -H "x-cipher-hash: sha256:$HASH" \
  --data-binary @"$FILE"

curl -s "$API/v1/quota" | jq .
```

### Stop
```bash
docker compose down
```

Data persists under `.data/postgres` and `.data/minio`.


