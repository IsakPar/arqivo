## Arqivo Staging Flip (Strict Auth + Hardened S3)

Follow these steps to configure buckets, policies, versioning, and start the API in STRICT mode.

### Env
```bash
export DATABASE_URL='postgres://USERNAME:PASSWORD@HOST:5432/arqivo'
export CLERK_SECRET_KEY='sk_live_xxx'
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_live_xxx'
export AWS_REGION='us-east-1'
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
export S3_BUCKET_US='arqivo-us'
export S3_BUCKET_EU='arqivo-eu'
unset DEV_AUTH_BYPASS
export STRICT_AUTH=true
```

### Ensure buckets
```bash
aws s3api head-bucket --bucket "$S3_BUCKET_US" || aws s3api create-bucket --bucket "$S3_BUCKET_US"
aws s3api head-bucket --bucket "$S3_BUCKET_EU" || \
  aws s3api create-bucket --bucket "$S3_BUCKET_EU" --create-bucket-configuration LocationConstraint="$AWS_REGION"
```

### Block public access (account + bucket)
```bash
aws s3control put-public-access-block --account-id "$AWS_ACCOUNT_ID" \
  --public-access-block-configuration file://infra/s3-block-public-access.json
aws s3api put-public-access-block --bucket "$S3_BUCKET_US" \
  --public-access-block-configuration file://infra/s3-block-public-access.json
aws s3api put-public-access-block --bucket "$S3_BUCKET_EU" \
  --public-access-block-configuration file://infra/s3-block-public-access.json
```

### Policies & lifecycle
```bash
envsubst < infra/s3-bucket-policy.json > /tmp/s3-policy.json
aws s3api put-bucket-policy --bucket "$S3_BUCKET_US" --policy file:///tmp/s3-policy.json
aws s3api put-bucket-policy --bucket "$S3_BUCKET_EU" --policy file:///tmp/s3-policy.json

aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET_US" \
  --lifecycle-configuration file://infra/s3-lifecycle.json
aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET_EU" \
  --lifecycle-configuration file://infra/s3-lifecycle.json

aws s3api put-bucket-versioning --bucket "$S3_BUCKET_US" --versioning-configuration Status=Enabled
aws s3api put-bucket-versioning --bucket "$S3_BUCKET_EU" --versioning-configuration Status=Enabled
```

### Migrate & start
```bash
pnpm --filter @arqivo/api migrate
PORT=3001 pnpm --filter @arqivo/api start
```

### Smoke tests
```bash
FILE=/etc/hosts
HASH=$(openssl dgst -sha256 -binary "$FILE" | xxd -p -c 256)
API="http://localhost:3001"

# 1) unauth should 401
curl -i -X PUT "$API/v1/blobs/$HASH" \
  -H 'content-type: application/octet-stream' \
  --data-binary @"$FILE"

# 2) auth should 200/204 (replace $TOKEN)
curl -i -X PUT "$API/v1/blobs/$HASH" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/octet-stream' \
  -H "x-cipher-hash: sha256:$HASH" \
  --data-binary @"$FILE"

# 3) metadata/index allowlist & caps (should 413)
dd if=/dev/zero bs=1024 count=1100 of=/tmp/meta.cbor >/dev/null 2>&1
curl -i -X PUT "$API/v1/metadata/doc-oversize" -H 'content-type: application/cbor' --data-binary @/tmp/meta.cbor

# 4) request-id present
curl -is "$API/health" | grep -i x-request-id
```

Notes:
- If port 3001 is busy, set a different PORT.
- If you use AWS profiles: `export AWS_PROFILE=your-profile`.
- Ensure Clerk tokens come from your staging Clerk instance.
- Optional: S3 Object Lock must be enabled at bucket creation if needed later.


