import { spawn } from 'node:child_process';
import getPort from 'get-port';
import http from 'node:http';

let proc: any;
let url: string;

export async function startServer(env: Record<string,string> = {}) {
  const port = await getPort({ port: 4010 });
  url = `http://127.0.0.1:${port}`;
  const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/arqivo';
  // Run migrations against the target DB
  spawn('node', ['dist/migrate.js'], {
    env: { ...process.env, DATABASE_URL },
    stdio: 'ignore',
  });
  proc = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      PORT: String(port),
      STRICT_AUTH: env.STRICT_AUTH ?? 'false',
      DEV_AUTH_BYPASS: env.DEV_AUTH_BYPASS ?? 'true',
      MAX_BLOB_BYTES: '50000000',
      DATABASE_URL,
      NODE_ENV: 'test',
    },
    stdio: 'ignore',
  });
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const ok = await new Promise<boolean>((resolve) => {
      const req = http.get(`${url}/health`, (res) => resolve(res.statusCode === 200));
      req.on('error', () => resolve(false));
    });
    if (ok) return { baseUrl: url };
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server failed to start');
}

export async function stopServer() {
  if (proc) proc.kill('SIGTERM');
}

export function authHeaders() {
  // in dev mode tests, bypass is enabled; return empty headers
  return {} as Record<string,string>;
}


