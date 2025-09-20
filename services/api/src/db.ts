import { Pool, PoolClient } from 'pg';
import { config as loadEnv } from 'dotenv';
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/arqivo';

export const pool = new Pool({ connectionString: DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query(text, params);
  return { rows: res.rows as T[] };
}

export async function withAccount<T>(accountId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("select set_config('app.account_id',$1,false)", [accountId]);
    const result = await fn(client);
    return result;
  } finally {
    client.release();
  }
}



