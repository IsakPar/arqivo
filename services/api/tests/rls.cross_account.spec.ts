import { beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';

describe('RLS cross-account', () => {
  beforeAll(async () => {
    // ensure tables exist
    await import('../src/migrate.js');
  });

  it('denies selecting documents from another account', async () => {
    // Prepare two accounts
    const a1 = '11111111-1111-1111-1111-111111111111';
    const a2 = '22222222-2222-2222-2222-222222222222';
    const adminUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/arqivo';
    const admin = new Pool({ connectionString: adminUrl });
    await admin.query("insert into accounts(account_id, clerk_user_id) values ($1,'u1') on conflict do nothing", [a1]);
    await admin.query("insert into accounts(account_id, clerk_user_id) values ($1,'u2') on conflict do nothing", [a2]);
    await admin.query("insert into documents(doc_id, account_id, region_code, size_bytes) values ('d1',$1,'us',1) on conflict do nothing", [a1]);
    await admin.query("do $$ begin if not exists (select 1 from pg_roles where rolname='arqivo_app') then create role arqivo_app login password 'arqivo_app' nosuperuser; end if; end $$;");
    await admin.query("grant usage on schema public to arqivo_app");
    await admin.query("grant select on all tables in schema public to arqivo_app");
    await admin.end();

    const url = new URL(adminUrl);
    url.username = 'arqivo_app';
    url.password = 'arqivo_app';
    const app = new Pool({ connectionString: url.toString() });
    await app.query("select set_config('app.account_id',$1,false)", [a2]);
    const { rows } = await app.query("select * from documents where doc_id='d1'");
    await app.end();
    expect(rows.length).toBe(0);
  });
});


