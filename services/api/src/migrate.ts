import { query } from './db.js';

async function main() {
  await query(`
    -- Prevent concurrent migrations across test processes
    select pg_advisory_lock(727218);
    create extension if not exists "uuid-ossp";

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
    do $$ begin
      if not exists (
        select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        where t.relname = 'documents' and c.conname = 'documents_account_id_doc_id_unique'
      ) then
        alter table documents add constraint documents_account_id_doc_id_unique unique (account_id, doc_id);
      end if;
    end $$;
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

    -- Taxonomy schema (labels as DAG with closure table)
    create table if not exists label (
      id uuid primary key,
      account_id uuid not null references accounts(account_id) on delete cascade,
      name_cipher bytea not null,
      name_nonce bytea not null,
      name_tag bytea,
      slug_token text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    -- Ensure composite uniqueness for FK references on (account_id, id)
    do $$ begin
      if not exists (
        select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        where t.relname = 'label' and c.conname = 'label_account_id_id_unique'
      ) then
        alter table label add constraint label_account_id_id_unique unique (account_id, id);
      end if;
    end $$;
    create index if not exists label_account_slug on label(account_id, slug_token);

    create table if not exists label_edge (
      account_id uuid not null,
      parent_id uuid not null,
      child_id uuid not null,
      created_at timestamptz not null default now(),
      primary key(account_id, parent_id, child_id),
      foreign key (account_id, parent_id) references label(account_id, id) on delete cascade,
      foreign key (account_id, child_id) references label(account_id, id) on delete cascade,
      check (parent_id <> child_id)
    );

    create table if not exists label_closure (
      account_id uuid not null,
      ancestor_id uuid not null,
      descendant_id uuid not null,
      depth int not null,
      primary key(account_id, ancestor_id, descendant_id),
      foreign key (account_id, ancestor_id) references label(account_id, id) on delete cascade,
      foreign key (account_id, descendant_id) references label(account_id, id) on delete cascade
    );
    create index if not exists label_closure_acc_anc on label_closure(account_id, ancestor_id);
    create index if not exists label_closure_acc_desc on label_closure(account_id, descendant_id);

    create table if not exists document_label (
      account_id uuid not null,
      doc_id text not null,
      label_id uuid not null,
      primary key(account_id, doc_id, label_id),
      foreign key (account_id, label_id) references label(account_id, id) on delete cascade,
      foreign key (account_id, doc_id) references documents(account_id, doc_id) on delete cascade
    );

    -- RLS for taxonomy tables (GUC app.account_id is set per-request by API layer)
    alter table if exists label enable row level security;
    alter table if exists label_edge enable row level security;
    alter table if exists label_closure enable row level security;
    alter table if exists document_label enable row level security;
    alter table if exists label force row level security;
    alter table if exists label_edge force row level security;
    alter table if exists label_closure force row level security;
    alter table if exists document_label force row level security;
    -- Enable RLS on additional tables containing tenant data
    alter table if exists documents enable row level security;
    alter table if exists devices enable row level security;
    alter table if exists quotas enable row level security;
    alter table if exists billing_customers enable row level security;
    alter table if exists billing_subscriptions enable row level security;
    alter table if exists documents force row level security;
    alter table if exists devices force row level security;
    alter table if exists quotas force row level security;
    alter table if exists billing_customers force row level security;
    alter table if exists billing_subscriptions force row level security;

    drop policy if exists label_tenant on label;
    create policy label_tenant on label using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists label_edge_tenant on label_edge;
    create policy label_edge_tenant on label_edge using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists label_closure_tenant on label_closure;
    create policy label_closure_tenant on label_closure using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists document_label_tenant on document_label;
    create policy document_label_tenant on document_label using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    -- Tenant policies for other tables
    drop policy if exists documents_tenant on documents;
    create policy documents_tenant on documents using (
      current_setting('app.account_id', true) is not null
      and length(current_setting('app.account_id', true)) > 0
      and account_id = current_setting('app.account_id', true)::uuid
    ) with check (
      current_setting('app.account_id', true) is not null
      and length(current_setting('app.account_id', true)) > 0
      and account_id = current_setting('app.account_id', true)::uuid
    );
    drop policy if exists devices_tenant on devices;
    create policy devices_tenant on devices using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists quotas_tenant on quotas;
    create policy quotas_tenant on quotas using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists billing_customers_tenant on billing_customers;
    create policy billing_customers_tenant on billing_customers using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);
    drop policy if exists billing_subscriptions_tenant on billing_subscriptions;
    create policy billing_subscriptions_tenant on billing_subscriptions using (account_id = current_setting('app.account_id')::uuid) with check (account_id = current_setting('app.account_id')::uuid);

    -- Stored procedures
    -- Drop dependent triggers before dropping functions to avoid dependency errors
    drop trigger if exists trg_sibling_unique on label_edge;
    drop trigger if exists tg_sibling_unique on label_edge;
    drop function if exists create_label(bytea, bytea, bytea, text);
    drop function if exists add_edge(uuid, uuid);
    drop function if exists rebuild_closure();
    drop function if exists remove_edge(uuid, uuid);
    drop function if exists rename_label(uuid, bytea, bytea, bytea, text);
    drop function if exists attach_file(text, uuid);
    drop function if exists detach_file(text, uuid);
    drop function if exists move_label(uuid, uuid[], uuid);
    drop function if exists delete_label(uuid, boolean);
    drop function if exists enforce_sibling_uniqueness();
    create or replace function create_label(
      p_name_cipher bytea, p_name_nonce bytea, p_name_tag bytea, p_slug_token text
    ) returns uuid as $$
    declare v_id uuid := uuid_generate_v4(); v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then
        raise exception 'missing app.account_id';
      end if;
      v_acct := v_acct_text::uuid;
      insert into label(id, account_id, name_cipher, name_nonce, name_tag, slug_token)
      values (v_id, v_acct, p_name_cipher, p_name_nonce, p_name_tag, p_slug_token);
      insert into label_closure(account_id, ancestor_id, descendant_id, depth)
      values (v_acct, v_id, v_id, 0);
      return v_id;
    end $$ language plpgsql;

    create or replace function add_edge(p_parent uuid, p_child uuid) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      insert into label_edge(account_id, parent_id, child_id)
      values (v_acct, p_parent, p_child)
      on conflict do nothing;

      insert into label_closure(account_id, ancestor_id, descendant_id, depth)
      select v_acct, p.ancestor_id, c.descendant_id, p.depth + c.depth + 1
      from label_closure p, label_closure c
      where p.account_id = v_acct and c.account_id = v_acct
        and p.descendant_id = p_parent and c.ancestor_id = p_child
      on conflict do nothing;
    end $$ language plpgsql;

    create or replace function rebuild_closure() returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      delete from label_closure where account_id = v_acct and depth > 0;
      with recursive walk(ancestor_id, descendant_id, depth) as (
        select e.parent_id, e.child_id, 1 from label_edge e where e.account_id = v_acct
        union all
        select w.ancestor_id, e.child_id, w.depth + 1
        from walk w
        join label_edge e on e.account_id = v_acct and e.parent_id = w.descendant_id
      )
      insert into label_closure(account_id, ancestor_id, descendant_id, depth)
      select v_acct, ancestor_id, descendant_id, depth from walk
      on conflict do nothing;
    end $$ language plpgsql;

    create or replace function remove_edge(p_parent uuid, p_child uuid) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      delete from label_edge where account_id = v_acct and parent_id = p_parent and child_id = p_child;
      perform rebuild_closure();
    end $$ language plpgsql;

    create or replace function rename_label(p_id uuid, p_cipher bytea, p_nonce bytea, p_tag bytea, p_slug_token text)
    returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      update label set name_cipher = coalesce(p_cipher, name_cipher), name_nonce = coalesce(p_nonce, name_nonce), name_tag = coalesce(p_tag, name_tag), slug_token = coalesce(p_slug_token, slug_token), updated_at = now()
      where id = p_id and account_id = v_acct;
    end $$ language plpgsql;

    create or replace function attach_file(p_doc_id text, p_label_id uuid) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      insert into document_label(account_id, doc_id, label_id) values (v_acct, p_doc_id, p_label_id)
      on conflict do nothing;
    end $$ language plpgsql;

    create or replace function detach_file(p_doc_id text, p_label_id uuid) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      delete from document_label where account_id = v_acct and doc_id = p_doc_id and label_id = p_label_id;
    end $$ language plpgsql;

    create or replace function move_label(p_id uuid, p_from uuid[], p_to uuid) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      -- remove edges from all parents in p_from
      delete from label_edge where account_id = v_acct and child_id = p_id and parent_id = any(p_from);
      -- add edge to new parent
      insert into label_edge(account_id, parent_id, child_id) values (v_acct, p_to, p_id) on conflict do nothing;
      perform rebuild_closure();
    end $$ language plpgsql;

    create or replace function delete_label(p_id uuid, p_cascade boolean) returns void as $$
    declare v_acct_text text := current_setting('app.account_id', true); v_acct uuid;
    begin
      if v_acct_text is null or length(v_acct_text) = 0 then raise exception 'missing app.account_id'; end if;
      v_acct := v_acct_text::uuid;
      if p_cascade then
        delete from label where account_id = v_acct and id = p_id;
      else
        -- detach edges first to keep children reachable if desired
        delete from label_edge where account_id = v_acct and (parent_id = p_id or child_id = p_id);
        delete from label where account_id = v_acct and id = p_id;
        perform rebuild_closure();
      end if;
    end $$ language plpgsql;

    -- Sibling uniqueness trigger: no two children under same parent with identical slug
    create or replace function enforce_sibling_uniqueness() returns trigger as $$
    declare v_same_edge int;
    declare v_conflict int;
    begin
      -- If the exact edge already exists, make the insert/update a no-op
      select count(*) into v_same_edge
      from label_edge e
      where e.account_id = NEW.account_id and e.parent_id = NEW.parent_id and e.child_id = NEW.child_id;
      if v_same_edge > 0 then
        return null;
      end if;

      -- Otherwise, enforce uniqueness of slug among siblings (different child with same slug)
      select count(*) into v_conflict
      from label_edge e
      join label c_existing on c_existing.account_id = e.account_id and c_existing.id = e.child_id
      join label c_new on c_new.account_id = NEW.account_id and c_new.id = NEW.child_id
      where e.account_id = NEW.account_id
        and e.parent_id = NEW.parent_id
        and c_existing.slug_token = c_new.slug_token
        and e.child_id <> NEW.child_id;
      if v_conflict > 0 then
        raise exception 'sibling with same slug already exists';
      end if;
      return NEW;
    end $$ language plpgsql;
    drop trigger if exists trg_sibling_unique on label_edge;
    create trigger trg_sibling_unique before insert or update on label_edge for each row execute procedure enforce_sibling_uniqueness();
    -- Release advisory lock
    select pg_advisory_unlock(727218);

    -- Test role for RLS validation (non-superuser, no BYPASSRLS)
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'arqivo_app') then
        create role arqivo_app login password 'arqivo_app' nosuperuser nocreatedb nocreaterole noreplication;
      end if;
    end $$;
    grant usage on schema public to arqivo_app;
    grant select, insert, update, delete on all tables in schema public to arqivo_app;
    alter default privileges in schema public grant select, insert, update, delete on tables to arqivo_app;
  `);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



