#!/usr/bin/env bash
set -euo pipefail

echo "[staging] Ensuring required env vars..."
: "${DATABASE_URL:?}"
: "${CLERK_SECRET_KEY:?}"
: "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:?}"
: "${AWS_REGION:?}"
: "${S3_BUCKET_US:?}"
: "${S3_BUCKET_EU:?}"

export AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
unset DEV_AUTH_BYPASS || true
export STRICT_AUTH=true

echo "[staging] Ensure buckets..."
aws s3api head-bucket --bucket "$S3_BUCKET_US" || aws s3api create-bucket --bucket "$S3_BUCKET_US"
aws s3api head-bucket --bucket "$S3_BUCKET_EU" || \
  aws s3api create-bucket --bucket "$S3_BUCKET_EU" --create-bucket-configuration LocationConstraint="$AWS_REGION"

echo "[staging] Block public access (account + bucket)..."
aws s3control put-public-access-block --account-id "$AWS_ACCOUNT_ID" \
  --public-access-block-configuration file://infra/s3-block-public-access.json
aws s3api put-public-access-block --bucket "$S3_BUCKET_US" \
  --public-access-block-configuration file://infra/s3-block-public-access.json
aws s3api put-public-access-block --bucket "$S3_BUCKET_EU" \
  --public-access-block-configuration file://infra/s3-block-public-access.json

echo "[staging] Apply policies and lifecycle..."
envsubst < infra/s3-bucket-policy.json > /tmp/s3-policy.json
aws s3api put-bucket-policy --bucket "$S3_BUCKET_US" --policy file:///tmp/s3-policy.json
aws s3api put-bucket-policy --bucket "$S3_BUCKET_EU" --policy file:///tmp/s3-policy.json
aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET_US" \
  --lifecycle-configuration file://infra/s3-lifecycle.json
aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET_EU" \
  --lifecycle-configuration file://infra/s3-lifecycle.json
aws s3api put-bucket-versioning --bucket "$S3_BUCKET_US" --versioning-configuration Status=Enabled
aws s3api put-bucket-versioning --bucket "$S3_BUCKET_EU" --versioning-configuration Status=Enabled

echo "[staging] Migrate DB..."
pnpm --filter @arqivo/api migrate

echo "[staging] Start API on PORT=${PORT:-3001} (STRICT_AUTH=true)..."
PORT=${PORT:-3001} pnpm --filter @arqivo/api start


