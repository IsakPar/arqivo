import { Pool } from 'pg';
import { config as loadEnv } from 'dotenv';
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/arqivo';

export const pool = new Pool({ connectionString: DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query(text, params);
  return { rows: res.rows as T[] };
}



