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
      doc_hash text,
      wrapped_fk bytea,
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
    create table if not exists billing_customers (
      account_id uuid primary key references accounts(account_id) on delete cascade,
      stripe_customer_id text unique not null,
      created_at timestamptz not null default now()
    );
    create table if not exists billing_subscriptions (
      account_id uuid primary key references accounts(account_id) on delete cascade,
      stripe_subscription_id text unique not null,
      plan text not null check (plan in ('free','standard','pro','enterprise')),
      status text not null,
      current_period_end timestamptz,
      cancel_at_period_end boolean not null default false,
      raw jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );
  `);

  // Enable RLS and basic policies
  await query(`
    alter table if exists accounts enable row level security;
    alter table if exists devices enable row level security;
    alter table if exists documents enable row level security;
    alter table if exists audit_logs enable row level security;
    alter table if exists quotas enable row level security;
    alter table if exists billing_customers enable row level security;
    alter table if exists billing_subscriptions enable row level security;

    -- helper to store current account id in session
    do $$ begin
      create or replace function set_app_account(a uuid) returns void as $$
      begin
        perform set_config('app.account_id', a::text, true);
      end;$$ language plpgsql;
    exception when others then null; end $$;

    -- policies: allow owner, block others (documents and quotas shown; extend similarly where needed)
    do $$ begin
      create policy documents_owner on documents using (account_id::text = current_setting('app.account_id', true));
    exception when others then null; end $$;

    do $$ begin
      create policy quotas_owner on quotas using (account_id::text = current_setting('app.account_id', true));
    exception when others then null; end $$;
  `);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



