import { Pool } from 'pg';
import { config as loadEnv } from 'dotenv';
loadEnv();

const defaultUrl = process.env.NODE_ENV === 'test'
  ? 'postgres://postgres:postgres@localhost:5432/arqivo'
  : 'postgres://user:pass@localhost:5432/arqivo';
const DATABASE_URL = process.env.DATABASE_URL || defaultUrl;

export const pool = new Pool({ connectionString: DATABASE_URL });

// Per-connection safety timeouts
pool.on('connect', async (client) => {
  try {
    await client.query(`SET statement_timeout = '5s'; SET idle_in_transaction_session_timeout = '5s'; SET lock_timeout = '3s';`);
  } catch {}
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query(text, params);
  return { rows: res.rows as T[] };
}



