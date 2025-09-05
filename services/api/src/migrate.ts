import { query } from './db.js';

async function main() {
  await query(`
    create table if not exists accounts (
      account_id uuid primary key,
      clerk_user_id text unique not null,
      region_code text not null default 'us'
    );
    create table if not exists quotas (
      account_id uuid primary key references accounts(account_id) on delete cascade,
      byte_count bigint not null default 0,
      doc_count bigint not null default 0
    );
    create table if not exists devices (
      device_id uuid primary key,
      account_id uuid not null references accounts(account_id) on delete cascade,
      public_key text not null,
      created_at timestamptz not null default now()
    );
    create unique index if not exists devices_unique_pubkey on devices(public_key);
    create table if not exists documents (
      doc_id text primary key,
      account_id uuid not null references accounts(account_id) on delete cascade,
      region_code text not null,
      size_bytes bigint not null,
      created_at timestamptz not null default now()
    );
    create table if not exists audit_logs (
      id bigserial primary key,
      ts timestamptz not null default now(),
      account_id uuid,
      method text not null,
      path text not null,
      status int not null,
      bytes int not null default 0
    );
  `);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



